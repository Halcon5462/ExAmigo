from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import TaskStatistics
from .serializers import TaskStatisticsSerializer


class TaskStatisticsListView(generics.ListAPIView):
    serializer_class = TaskStatisticsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskStatistics.objects.filter(user=self.request.user).order_by(
            "subject", "order_KIM"
        )

