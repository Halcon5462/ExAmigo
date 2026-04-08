from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient, APIRequestFactory

from account.models import UserAccount
from statistic.models import TaskProgress, TaskStatistics
from taskBank.ege_scoring import SubjectChoices
from taskBank.models import ExamSession, Task, TaskCorrectAnswer, TaskSet, TaskSetItem, TaskSetType
from taskBank.serializers import TaskSerializer, TaskSetSerializer
from taskBank.services import TaskSetGenerator, exam_time_left, finish_exam_session, get_target_difficulty, pick_task


class TaskBankModelAndServiceTests(TestCase):
    def setUp(self):
        self.user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        self.task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=1,
            type="test",
            difficulty=2,
            description="Описание",
            author=self.user,
        )
        self.exam_set = TaskSet.objects.create(
            name="Экзамен",
            type=TaskSetType.EXAM,
            subject=SubjectChoices.MATH,
            author=self.user,
        )
        TaskSetItem.objects.create(task_set=self.exam_set, task=self.task, order=1)

    def test_task_primary_score_returns_score_from_mapping(self):
        self.assertEqual(self.task.primary_score, 1)

    def test_taskset_total_primary_score_sums_item_scores(self):
        second_task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=13,
            type="test",
            difficulty=4,
            description="Описание",
            author=self.user,
        )
        TaskSetItem.objects.create(task_set=self.exam_set, task=second_task, order=2)

        self.assertEqual(self.exam_set.total_primary_score, 3)

    def test_exam_time_left_returns_remaining_seconds(self):
        exam = ExamSession.objects.create(
            user=self.user,
            task_set=self.exam_set,
            time_limit=300,
        )
        exam.started_at = timezone.now() - timedelta(seconds=120)
        exam.save(update_fields=["started_at"])

        self.assertEqual(exam_time_left(exam), 180)

    def test_finish_exam_session_counts_correct_attempts(self):
        from statistic.models import TaskAttempt

        exam = ExamSession.objects.create(
            user=self.user,
            task_set=self.exam_set,
            time_limit=300,
        )
        TaskAttempt.objects.create(
            user=self.user,
            task=self.task,
            exam_session=exam,
            answer="42",
            is_correct=True,
        )
        TaskAttempt.objects.create(
            user=self.user,
            task=self.task,
            exam_session=exam,
            answer="24",
            is_correct=False,
        )

        finish_exam_session(exam)
        exam.refresh_from_db()

        self.assertTrue(exam.is_finished)
        self.assertEqual(exam.score, 1)
        self.assertIsNotNone(exam.finished_at)

    def test_finish_exam_session_returns_same_exam_if_already_finished(self):
        exam = ExamSession.objects.create(
            user=self.user,
            task_set=self.exam_set,
            time_limit=300,
            is_finished=True,
            score=7,
        )

        result = finish_exam_session(exam)

        self.assertEqual(result.score, 7)

    @patch("taskBank.services.random.choice", return_value=2)
    def test_get_target_difficulty_returns_easy_for_missing_stats(self, mocked_choice):
        difficulty = get_target_difficulty(None)

        self.assertEqual(difficulty, 2)
        mocked_choice.assert_called_once_with([1, 2])

    @patch("taskBank.services.random.choice", return_value=4)
    def test_get_target_difficulty_uses_middle_band_for_average_accuracy(self, mocked_choice):
        stats = TaskStatistics.objects.create(
            user=self.user,
            subject=SubjectChoices.MATH,
            order_KIM=1,
            attempts_count=10,
            correct_count=7,
        )

        difficulty = get_target_difficulty(stats)

        self.assertEqual(difficulty, 4)
        mocked_choice.assert_called_once_with([3, 4])

    def test_pick_task_prefers_unsolved_task_with_requested_difficulty(self):
        solved_task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=2,
            type="test",
            difficulty=3,
            description="Решённая",
            author=self.user,
        )
        unsolved_task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=2,
            type="test",
            difficulty=3,
            description="Нерешённая",
            author=self.user,
        )
        TaskProgress.objects.create(user=self.user, task=solved_task)

        task = pick_task(self.user, SubjectChoices.MATH, 2, 3)

        self.assertEqual(task.id, unsolved_task.id)

    def test_task_set_generator_returns_task_for_each_requested_number(self):
        second_task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=2,
            type="test",
            difficulty=4,
            description="Описание",
            author=self.user,
        )
        TaskStatistics.objects.create(
            user=self.user,
            subject=SubjectChoices.MATH,
            order_KIM=1,
            attempts_count=0,
            correct_count=0,
        )
        TaskStatistics.objects.create(
            user=self.user,
            subject=SubjectChoices.MATH,
            order_KIM=2,
            attempts_count=10,
            correct_count=10,
        )

        with patch("taskBank.services.random.choice", side_effect=[2, 4]):
            tasks = TaskSetGenerator.generate(self.user, SubjectChoices.MATH, [1, 2])

        self.assertEqual([task.order_KIM for task in tasks], [1, 2])
        self.assertIn(second_task.id, [task.id for task in tasks])


class TaskBankSerializerTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = UserAccount.objects.create_user(
            email="author@example.com",
            name="Author",
            password="secret123",
        )
        self.task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=3,
            type="test",
            difficulty=3,
            description="Описание",
            author=self.user,
        )

    def test_task_serializer_create_saves_author_and_correct_answer(self):
        request = self.factory.post("/api/taskBank/tasks/")
        request.user = self.user
        serializer = TaskSerializer(
            data={
                "subject": SubjectChoices.MATH,
                "order_KIM": 4,
                "type": "test",
                "difficulty": 2,
                "description": "Новая задача",
                "correct_answers": "123",
            },
            context={"request": request},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        task = serializer.save()

        self.assertEqual(task.author_id, self.user.id)
        self.assertEqual(task.correct_answers.count(), 1)
        self.assertEqual(task.correct_answers.first().answer_text, "123")

    def test_task_serializer_marks_task_as_solved_for_authenticated_user(self):
        TaskProgress.objects.create(user=self.user, task=self.task)
        request = self.factory.get("/api/taskBank/tasks/")
        request.user = self.user

        data = TaskSerializer(self.task, context={"request": request}).data

        self.assertTrue(data["already_solved"])

    def test_taskset_serializer_create_creates_items(self):
        request = self.factory.post("/api/taskBank/tasksets/")
        request.user = self.user
        serializer = TaskSetSerializer(
            data={
                "name": "Набор",
                "type": TaskSetType.TRAINING,
                "subject": SubjectChoices.MATH,
                "is_public": False,
                "items": [{"task": self.task.id, "order": 1}],
            },
            context={"request": request},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        taskset = serializer.save()

        self.assertEqual(taskset.author_id, self.user.id)
        self.assertEqual(taskset.items.count(), 1)

    def test_taskset_serializer_update_replaces_items(self):
        other_task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=5,
            type="test",
            difficulty=4,
            description="Другая задача",
            author=self.user,
        )
        taskset = TaskSet.objects.create(
            name="Набор",
            type=TaskSetType.TRAINING,
            subject=SubjectChoices.MATH,
            author=self.user,
        )
        TaskSetItem.objects.create(task_set=taskset, task=self.task, order=1)
        serializer = TaskSetSerializer(
            taskset,
            data={
                "name": "Новый набор",
                "type": TaskSetType.TRAINING,
                "subject": SubjectChoices.MATH,
                "is_public": True,
                "items": [{"task": other_task.id, "order": 1}],
            },
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated = serializer.save()

        self.assertEqual(updated.name, "Новый набор")
        self.assertEqual(updated.items.count(), 1)
        self.assertEqual(updated.items.first().task_id, other_task.id)


class TaskBankApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserAccount.objects.create_user(
            email="user@example.com",
            name="User",
            password="secret123",
        )
        self.client.force_authenticate(user=self.user)
        self.task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=1,
            type="test",
            difficulty=3,
            description="Описание",
            author=self.user,
        )
        TaskCorrectAnswer.objects.create(task=self.task, answer_text="42")

    def test_check_endpoint_returns_true_for_correct_answer(self):
        response = self.client.post(
            f"/api/taskBank/tasks/{self.task.id}/check/",
            {"answer": "42"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["correct"])

    def test_generate_exam_requires_subject(self):
        response = self.client.post("/api/taskBank/tasksets/generate-exam/", {}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_generate_exam_rejects_invalid_subject(self):
        response = self.client.post(
            "/api/taskBank/tasksets/generate-exam/",
            {"subject": "invalid"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "invalid subject")

    def test_generate_exam_returns_missing_numbers_when_bank_incomplete(self):
        response = self.client.post(
            "/api/taskBank/tasksets/generate-exam/",
            {"subject": SubjectChoices.MATH},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("missing", response.data)
        self.assertIn(2, response.data["missing"])

    def test_generate_exam_creates_exam_taskset(self):
        for number in range(2, 13):
            Task.objects.create(
                subject=SubjectChoices.MATH,
                order_KIM=number,
                type="test",
                difficulty=(number % 5) + 1,
                description=f"Задача {number}",
                author=self.user,
            )

        response = self.client.post(
            "/api/taskBank/tasksets/generate-exam/",
            {"subject": SubjectChoices.MATH, "name": "Пробник", "is_public": True},
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        taskset = TaskSet.objects.get(id=response.data["id"])
        self.assertEqual(taskset.type, TaskSetType.EXAM)
        self.assertEqual(taskset.items.count(), 12)
        self.assertTrue(taskset.is_public)

    def test_generate_endpoint_rejects_invalid_task_numbers(self):
        response = self.client.post(
            "/api/taskBank/tasksets/generate/",
            {"subject": SubjectChoices.MATH, "mode": "custom", "task_numbers": ["bad"]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_generate_endpoint_creates_taskset_from_custom_numbers(self):
        second_task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=2,
            type="test",
            difficulty=2,
            description="Описание",
            author=self.user,
        )

        with patch.object(TaskSetGenerator, "generate", return_value=[self.task, second_task]):
            response = self.client.post(
                "/api/taskBank/tasksets/generate/",
                {"subject": SubjectChoices.MATH, "mode": "custom", "task_numbers": [1, 2]},
                format="json",
            )

        self.assertEqual(response.status_code, 201, response.data)
        taskset = TaskSet.objects.get(id=response.data["id"])
        self.assertEqual(taskset.items.count(), 2)

    def test_start_exam_rejects_non_exam_taskset(self):
        taskset = TaskSet.objects.create(
            name="Тренировка",
            type=TaskSetType.TRAINING,
            subject=SubjectChoices.MATH,
            author=self.user,
        )

        response = self.client.post(f"/api/taskBank/tasksets/{taskset.id}/start-exam/")

        self.assertEqual(response.status_code, 400)

    def test_start_exam_creates_session_for_exam_taskset(self):
        taskset = TaskSet.objects.create(
            name="Экзамен",
            type=TaskSetType.EXAM,
            subject=SubjectChoices.MATH,
            author=self.user,
        )

        response = self.client.post(f"/api/taskBank/tasksets/{taskset.id}/start-exam/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(ExamSession.objects.filter(id=response.data["exam_id"], user=self.user).exists())

    def test_exam_detail_auto_finishes_expired_exam(self):
        taskset = TaskSet.objects.create(
            name="Экзамен",
            type=TaskSetType.EXAM,
            subject=SubjectChoices.MATH,
            author=self.user,
        )
        exam = ExamSession.objects.create(
            user=self.user,
            task_set=taskset,
            time_limit=10,
        )
        exam.started_at = timezone.now() - timedelta(seconds=60)
        exam.save(update_fields=["started_at"])

        response = self.client.get(f"/api/taskBank/exams/{exam.id}/")

        exam.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(exam.is_finished)
        self.assertEqual(response.data["time_left"], 0)

    def test_finish_exam_returns_exam_score(self):
        taskset = TaskSet.objects.create(
            name="Экзамен",
            type=TaskSetType.EXAM,
            subject=SubjectChoices.MATH,
            author=self.user,
        )
        exam = ExamSession.objects.create(
            user=self.user,
            task_set=taskset,
            time_limit=3600,
            score=3,
            is_finished=True,
        )

        response = self.client.post(f"/api/taskBank/exams/{exam.id}/finish/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["score"], 3)
