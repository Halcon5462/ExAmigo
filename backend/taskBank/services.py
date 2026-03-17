from django.utils import timezone


def exam_time_left(exam):
    elapsed = (timezone.now() - exam.started_at).total_seconds()
    return max(0, exam.time_limit - int(elapsed))


def finish_exam_session(exam):
    if exam.is_finished:
        return exam

    correct = exam.attempts.filter(is_correct=True).count()

    exam.score = correct
    exam.finished_at = timezone.now()
    exam.is_finished = True
    exam.save(update_fields=["score", "finished_at", "is_finished"])

    return exam

