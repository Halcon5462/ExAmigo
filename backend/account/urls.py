from django.urls import path
from .views import RegisterView, ProfileView, CustomTokenObtainPairView, UserAchievementListView, UserProgressListView
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from account.views import TaskSubmitView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('user-achievements/', UserAchievementListView.as_view(), name='user-achievements'),
    path('user-progress/', UserProgressListView.as_view(), name='user-progress'),
    path('task-progress/<int:pk>/submit/', TaskSubmitView.as_view(), name='task-submit'),
    
]