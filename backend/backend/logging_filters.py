import logging


class ExactLevelFilter(logging.Filter):
    """Разрешить записи только одного уровня регистрации."""

    def __init__(self, level_name):
        super().__init__()
        self.levelno = logging._nameToLevel[level_name]

    def filter(self, record):
        return record.levelno == self.levelno
