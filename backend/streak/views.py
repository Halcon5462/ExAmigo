from rest_framework import generics, permissions
from .models import UserStreak
from .serializers import UserStreakSerializer

class UserStreakDetailView(generics.RetrieveAPIView):
    serializer_class = UserStreakSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        streak, created = UserStreak.objects.get_or_create(user=self.request.user)
        return streak