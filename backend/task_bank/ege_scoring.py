from django.db import models


class SubjectChoices(models.TextChoices):
    """
    Выбор предметов.
    """
    MATH = "prof_math", "Профильная математика"
    RUSSIAN = "russian", "Русский язык"
    PHYSICS = "physics", "Физика"
    INFORM = "informatic", "Информатика"


EGE_TASK_SCORES = {
    SubjectChoices.MATH: {
        1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
        6: 1, 7: 1, 8: 1, 9: 1, 10: 1,
        11: 1, 12: 1,
        13: 2,
        14: 3,
        15: 2,
        16: 2,
        17: 3,
        18: 4,
        19: 4,
    },

    SubjectChoices.RUSSIAN: {
        1: 1, 2: 1, 3: 1, 4: 1,
        5: 1, 6: 1, 7: 1,
        8: 2,
        9: 1, 10: 1, 11: 1, 12: 1,
        13: 1, 14: 1, 15: 1, 16: 1,
        17: 1, 18: 1, 19: 1,
        20: 1, 21: 1, 22: 2,
        23: 1,
        24: 1,
        25: 1,
        26: 1,
        27: 22,
    }
}


def get_task_score(subject, order_kim):
    """
    Возвращает балл за задание ЕГЭ.
    """
    subject_scores = EGE_TASK_SCORES.get(subject)

    if not subject_scores:
        return 0

    return subject_scores.get(order_kim, 0)
