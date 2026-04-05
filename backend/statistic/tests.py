from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from account.models import UserAccount
from shop.models import WalletTransaction
from statistic.models import TaskAttempt, TaskProgress, TaskStatistics
from statistic.services import update_task_statistics
from taskBank.ege_scoring import SubjectChoices
from taskBank.models import ExamSession, Task, TaskCorrectAnswer, TaskSet, TaskSetItem, TaskSetType


class StatisticServiceTests(TestCase):
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
            difficulty=3,
            description="Описание",
            author=self.user,
        )

    def test_update_task_statistics_creates_new_record(self):
        update_task_statistics(
            user=self.user,
            task=self.task,
            is_correct=True,
            first_time=True,
        )

        stats = TaskStatistics.objects.get(user=self.user, subject=self.task.subject, order_KIM=self.task.order_KIM)
        self.assertEqual(stats.attempts_count, 1)
        self.assertEqual(stats.correct_count, 1)
        self.assertEqual(stats.correct_first_try, 1)
        self.assertIsNotNone(stats.last_attempt_at)

    def test_update_task_statistics_increments_existing_record(self):
        TaskStatistics.objects.create(
            user=self.user,
            subject=self.task.subject,
            order_KIM=self.task.order_KIM,
            attempts_count=1,
            correct_count=0,
            correct_first_try=0,
        )

        update_task_statistics(
            user=self.user,
            task=self.task,
            is_correct=False,
            first_time=False,
        )

        stats = TaskStatistics.objects.get(user=self.user, subject=self.task.subject, order_KIM=self.task.order_KIM)
        self.assertEqual(stats.attempts_count, 2)
        self.assertEqual(stats.correct_count, 0)
        self.assertEqual(stats.correct_first_try, 0)


class StatisticApiTests(TestCase):
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
        self.exam_taskset = TaskSet.objects.create(
            name="Экзамен",
            type=TaskSetType.EXAM,
            subject=SubjectChoices.MATH,
            author=self.user,
        )
        TaskSetItem.objects.create(task_set=self.exam_taskset, task=self.task, order=1)

    def test_statistics_list_returns_only_current_user_records(self):
        other_user = UserAccount.objects.create_user(
            email="other@example.com",
            name="Other",
            password="secret123",
        )
        TaskStatistics.objects.create(
            user=self.user,
            subject=SubjectChoices.MATH,
            order_KIM=1,
            attempts_count=2,
            correct_count=1,
            correct_first_try=1,
        )
        TaskStatistics.objects.create(
            user=other_user,
            subject=SubjectChoices.MATH,
            order_KIM=2,
            attempts_count=5,
            correct_count=3,
            correct_first_try=1,
        )

        response = self.client.get("/api/statistic/tasks/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["order_KIM"], 1)

    def test_submit_requires_answer(self):
        response = self.client.post(f"/api/statistic/task-progress/{self.task.id}/submit/", {}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Answer required")

    def test_submit_returns_404_for_unknown_exam_session(self):
        response = self.client.post(
            f"/api/statistic/task-progress/{self.task.id}/submit/",
            {"answer": "42", "exam_session": 9999},
            format="json",
        )

        self.assertEqual(response.status_code, 404)

    def test_submit_rejects_finished_exam_session(self):
        exam = ExamSession.objects.create(
            user=self.user,
            task_set=self.exam_taskset,
            time_limit=300,
            is_finished=True,
        )

        response = self.client.post(
            f"/api/statistic/task-progress/{self.task.id}/submit/",
            {"answer": "42", "exam_session": exam.id},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Exam session finished")

    def test_submit_finishes_exam_when_time_is_over(self):
        exam = ExamSession.objects.create(
            user=self.user,
            task_set=self.exam_taskset,
            time_limit=10,
        )
        exam.started_at = timezone.now() - timedelta(seconds=20)
        exam.save(update_fields=["started_at"])

        response = self.client.post(
            f"/api/statistic/task-progress/{self.task.id}/submit/",
            {"answer": "42", "exam_session": exam.id},
            format="json",
        )

        exam.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        self.assertTrue(exam.is_finished)
        self.assertEqual(response.data["error"], "Exam time is over")

    def test_submit_rejects_task_outside_exam_set(self):
        other_task = Task.objects.create(
            subject=SubjectChoices.MATH,
            order_KIM=2,
            type="test",
            difficulty=2,
            description="Другая задача",
            author=self.user,
        )
        exam = ExamSession.objects.create(
            user=self.user,
            task_set=self.exam_taskset,
            time_limit=300,
        )

        response = self.client.post(
            f"/api/statistic/task-progress/{other_task.id}/submit/",
            {"answer": "1", "exam_session": exam.id},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Task is not in this exam")

    def test_submit_rejects_second_attempt_in_exam(self):
        exam = ExamSession.objects.create(
            user=self.user,
            task_set=self.exam_taskset,
            time_limit=300,
        )
        TaskAttempt.objects.create(
            user=self.user,
            task=self.task,
            exam_session=exam,
            answer="42",
            is_correct=True,
        )

        response = self.client.post(
            f"/api/statistic/task-progress/{self.task.id}/submit/",
            {"answer": "42", "exam_session": exam.id},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Only one attempt allowed in exam")

    def test_submit_incorrect_answer_creates_attempt_and_updates_stats(self):
        response = self.client.post(
            f"/api/statistic/task-progress/{self.task.id}/submit/",
            {"answer": "24"},
            format="json",
        )

        stats = TaskStatistics.objects.get(user=self.user, subject=self.task.subject, order_KIM=self.task.order_KIM)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["correct"])
        self.assertEqual(response.data["reward"], 0)
        self.assertEqual(TaskAttempt.objects.count(), 1)
        self.assertEqual(stats.attempts_count, 1)
        self.assertEqual(stats.correct_count, 0)

    def test_submit_first_correct_answer_gives_reward_and_progress(self):
        response = self.client.post(
            f"/api/statistic/task-progress/{self.task.id}/submit/",
            {"answer": " 4 2 "},
            format="json",
        )

        self.user.wallet.refresh_from_db()
        stats = TaskStatistics.objects.get(user=self.user, subject=self.task.subject, order_KIM=self.task.order_KIM)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["correct"])
        self.assertTrue(response.data["first_time"])
        self.assertEqual(response.data["reward"], 25)
        self.assertEqual(response.data["new_balance"], 25)
        self.assertTrue(TaskProgress.objects.filter(user=self.user, task=self.task).exists())
        self.assertEqual(self.user.wallet.balance, 25)
        self.assertEqual(stats.correct_first_try, 1)
        self.assertEqual(WalletTransaction.objects.count(), 1)

    def test_submit_repeated_correct_answer_does_not_reward_again(self):
        TaskProgress.objects.create(user=self.user, task=self.task)

        response = self.client.post(
            f"/api/statistic/task-progress/{self.task.id}/submit/",
            {"answer": "42"},
            format="json",
        )

        self.user.wallet.refresh_from_db()
        stats = TaskStatistics.objects.get(user=self.user, subject=self.task.subject, order_KIM=self.task.order_KIM)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["correct"])
        self.assertFalse(response.data["first_time"])
        self.assertEqual(response.data["reward"], 0)
        self.assertEqual(self.user.wallet.balance, 0)
        self.assertEqual(stats.correct_count, 1)
        self.assertEqual(stats.correct_first_try, 0)
