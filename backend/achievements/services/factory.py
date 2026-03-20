from achievements.services.strategies import (
    DifficultyStrategy,
    FirstTryStrategy,
    SolveTasksStrategy,
)


class AchievementStrategyFactory:
    strategies = {
        "solve_tasks": SolveTasksStrategy(),
        "first_try": FirstTryStrategy(),
        "difficulty_master": DifficultyStrategy(),
    }

    @classmethod
    def get_strategy(cls, action_type):
        return cls.strategies.get(action_type)
