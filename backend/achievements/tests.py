from tempfile import mkdtemp

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from account.models import UserAccount
from achievements.api.serializers import AchievementListSerializer
from achievements.models import Achievement, UserAchievement, UserAchievementProgress
from achievements.services.achievement_service import AchievementService
from achievements.services.factory import AchievementStrategyFactory


@override_settings(MEDIA_ROOT=mkdtemp())
class AchievementModelAndSerializerTests(TestCase):
    def setUp(self):
        self.user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        self.achievement = Achievement.objects.create(
            name="Первый шаг",
            description="Описание",
            action_type="solve_tasks",
            target=3,
            icon=SimpleUploadedFile("icon.jpg", b"icon-data", content_type="image/jpeg"),
        )

    def test_progress_completion_property_reflects_target(self):
        progress = UserAchievementProgress.objects.create(
            user=self.user,
            achievement=self.achievement,
            current_value=3,
        )

        self.assertTrue(progress.is_completed)

    def test_serializer_calculates_progress_percent(self):
        self.achievement.current_value = 2
        self.achievement.is_obtained = False

        data = AchievementListSerializer(self.achievement).data

        self.assertEqual(data["progress_percent"], 66)

    def test_serializer_returns_hundred_percent_when_target_missing(self):
        self.achievement.target = 0
        self.achievement.current_value = 5
        self.achievement.is_obtained = True

        data = AchievementListSerializer(self.achievement).data

        self.assertEqual(data["progress_percent"], 100)

    def test_factory_returns_none_for_unknown_strategy(self):
        self.assertIsNone(AchievementStrategyFactory.get_strategy("unknown"))


@override_settings(MEDIA_ROOT=mkdtemp())
class AchievementServiceTests(TestCase):
    def setUp(self):
        self.user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        self.solve_achievement = Achievement.objects.create(
            name="Реши две",
            description="Описание",
            action_type="solve_tasks",
            target=2,
            icon=SimpleUploadedFile("solve.jpg", b"icon-data", content_type="image/jpeg"),
        )
        self.first_try_achievement = Achievement.objects.create(
            name="С первого раза",
            description="Описание",
            action_type="first_try",
            target=1,
            icon=SimpleUploadedFile("first.jpg", b"icon-data", content_type="image/jpeg"),
        )
        self.difficulty_achievement = Achievement.objects.create(
            name="Мастер",
            description="Описание",
            action_type="difficulty_master",
            target=1,
            icon=SimpleUploadedFile("difficulty.jpg", b"icon-data", content_type="image/jpeg"),
            condition={"difficulty": 5},
        )

    def test_handle_event_creates_progress_without_reward_before_target(self):
        AchievementService.handle_event(self.user, "solve_tasks")

        progress = UserAchievementProgress.objects.get(
            user=self.user,
            achievement=self.solve_achievement,
        )
        self.assertEqual(progress.current_value, 1)
        self.assertFalse(
            UserAchievement.objects.filter(
                user=self.user,
                achievement=self.solve_achievement,
            ).exists()
        )

    def test_handle_event_creates_user_achievement_on_completion(self):
        AchievementService.handle_event(self.user, "solve_tasks")
        AchievementService.handle_event(self.user, "solve_tasks")

        self.assertTrue(
            UserAchievement.objects.filter(
                user=self.user,
                achievement=self.solve_achievement,
            ).exists()
        )

    def test_first_try_strategy_requires_flag(self):
        AchievementService.handle_event(self.user, "first_try", context={"first_time": False})

        self.assertFalse(
            UserAchievementProgress.objects.filter(
                user=self.user,
                achievement=self.first_try_achievement,
            ).exists()
        )

    def test_difficulty_strategy_checks_required_difficulty(self):
        AchievementService.handle_event(self.user, "difficulty_master", context={"difficulty": 3})

        self.assertFalse(
            UserAchievementProgress.objects.filter(
                user=self.user,
                achievement=self.difficulty_achievement,
            ).exists()
        )

    def test_difficulty_strategy_awards_when_context_matches(self):
        AchievementService.handle_event(self.user, "difficulty_master", context={"difficulty": 5})

        self.assertTrue(
            UserAchievement.objects.filter(
                user=self.user,
                achievement=self.difficulty_achievement,
            ).exists()
        )


@override_settings(MEDIA_ROOT=mkdtemp())
class AchievementApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        self.achievement = Achievement.objects.create(
            name="Первый шаг",
            description="Описание",
            action_type="solve_tasks",
            target=3,
            icon=SimpleUploadedFile("icon.jpg", b"icon-data", content_type="image/jpeg"),
        )
        UserAchievementProgress.objects.create(
            user=self.user,
            achievement=self.achievement,
            current_value=1,
        )

    def test_achievement_list_requires_authentication(self):
        response = self.client.get("/api/achievements/")

        self.assertEqual(response.status_code, 401)

    def test_achievement_list_returns_progress_for_current_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/achievements/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["current_value"], 1)
        self.assertFalse(response.data[0]["is_obtained"])
