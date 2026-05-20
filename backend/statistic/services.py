from django.db import transaction, DatabaseError
from django.utils import timezone

from achievements.services.achievement_service import AchievementService
from shop.services import WalletService
from task_bank.models import ExamSession
from task_bank.services import exam_time_left, finish_exam_session
from streak.services import update_user_streak

from .models import TaskAttempt, TaskProgress, TaskStatistics


DIFFICULTY_MAP = {
    1: "easy",
    2: "easy",
    3: "medium",
    4: "hard",
    5: "expert",
}


def update_task_statistics(user, task, is_correct: bool, first_time: bool) -> None:
    """
    Обновляет агрегированную статистику по заданию.
    """
    stats, _ = TaskStatistics.objects.get_or_create(
        user=user,
        subject=task.subject,
        order_KIM=task.order_KIM,
        defaults={"attempts_count": 0, "correct_count": 0, "correct_first_try": 0},
    )

    stats.attempts_count += 1
    if is_correct:
        stats.correct_count += 1
        if first_time:
            stats.correct_first_try += 1

    stats.last_attempt_at = timezone.now()
    stats.save()


def validate_exam(task, user, exam_id):
    if not exam_id:
        return None

    try:
        exam = ExamSession.objects.select_related("task_set").get(
            id=exam_id,
            user=user,
        )
    except ExamSession.DoesNotExist:
        return "not_found"

    if exam.is_finished:
        return "finished"

    if exam_time_left(exam) <= 0:
        finish_exam_session(exam)
        return "timeout"

    if not exam.task_set.items.filter(task_id=task.id).exists():
        return "invalid_task"

    if TaskAttempt.objects.filter(exam_session_id=exam_id, task=task).exists():
        return "duplicate"

    return exam


def normalize_answer(answer: str) -> str:
    return "".join(answer.replace(",", ".").split()).lower()


def check_answer(task, user_answer: str) -> bool:
    cleaned = normalize_answer(user_answer)

    return any(
        normalize_answer(a.answer_text) == cleaned
        for a in task.correct_answers.all()
    )


def handle_reward(user, task, created):
    reward = 0
    transaction_data = None

    if not created:
        return reward, transaction_data

    difficulty = DIFFICULTY_MAP.get(task.difficulty, "easy")

    transaction_data = WalletService.add_task_reward(
        user=user,
        task_difficulty=difficulty,
        task_title=f"{task.subject}, номер-{task.order_KIM}, сложность: {task.difficulty}",
    )

    return transaction_data["amount"], transaction_data


def handle_achievements(user, task, first_time):
    AchievementService.handle_event(
        user=user,
        event="solve_tasks",
        context={"difficulty": task.difficulty, "first_time": first_time},
    )

    if first_time:
        AchievementService.handle_event(
            user=user,
            event="first_try",
            context={"first_time": True, "subject": task.subject},
        )

    AchievementService.handle_event(
        user=user,
        event="difficulty_master",
        context={"difficulty": task.difficulty},
    )


def process_task_submit(task, user, user_answer, exam):
    is_correct = check_answer(task, user_answer)

    reward = 0
    first_time = False
    transaction_data = None

    with transaction.atomic():
        TaskAttempt.objects.create(
            user=user,
            task=task,
            exam_session=exam,
            answer=user_answer,
            is_correct=is_correct,
        )

        if is_correct:
            try:
                update_user_streak(user)
            except DatabaseError:
                pass

            _, created = TaskProgress.objects.get_or_create(user=user, task=task)

            if created:
                first_time = True
                reward, transaction_data = handle_reward(user, task, True)

            handle_achievements(user, task, first_time)

        update_task_statistics(
            user=user,
            task=task,
            is_correct=is_correct,
            first_time=first_time,
        )

    response = {
        "correct": is_correct,
        "first_time": first_time,
        "reward": reward,
    }

    if transaction_data:
        response["new_balance"] = transaction_data["new_balance"]

    return response
