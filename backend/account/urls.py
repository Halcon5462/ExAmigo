from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from account.views import TaskSubmitView
from .views import AvatarListView, ChangeAvatarView, CustomTokenObtainPairView, ProfileView, RegisterView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('avatars/', AvatarListView.as_view(), name='avatar-list'),
    path('avatar/change/', ChangeAvatarView.as_view(), name='avatar-change'),
    path('task-progress/<int:pk>/submit/', TaskSubmitView.as_view(), name='task-submit'),
]
