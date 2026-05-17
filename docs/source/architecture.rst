Architecture
============

Общая архитектура проекта основана на Django + Django REST Framework.

Проект разделён на доменные модули:

Core modules
------------

- task_bank — банк заданий и генерация экзаменов
- statistic — аналитика и пользовательская статистика
- streak — система ежедневной активности
- achievements — достижения пользователя
- competitions — соревнования

Commerce modules
----------------

- shop — внутренняя экономика и покупки
- products — товары и инвентарь

AI & helpers
------------

- help_ai — AI-помощник
- tools — вспомогательные утилиты

Authentication
--------------

- account — пользователи и авторизация

Каждый модуль содержит:
- models (данные)
- views (API)
- services (бизнес-логика)
- serializers (API слой)