from django.db import OperationalError, ProgrammingError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from achievements.api.serializers import AchievementListSerializer
from achievements.utils.queries import get_user_achievements


class AchievementListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            achievements = get_user_achievements(request.user)
            serializer = AchievementListSerializer(achievements, many=True)
            return Response(serializer.data)
        except (OperationalError, ProgrammingError):
            return Response([])
