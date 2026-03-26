from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Avatar, UserAccount
from .serializers import AvatarSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *_args, **_kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = UserAccount.objects.get(email=request.data['email'])
            response.data['user'] = UserSerializer(user, context={'request': request}).data
        return response


class AvatarListView(generics.ListAPIView):
    queryset = Avatar.objects.filter(is_active=True)
    serializer_class = AvatarSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChangeAvatarView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        avatar_id = request.data.get('avatar_id')
        avatar_file = request.FILES.get('avatar')

        if avatar_id and avatar_file:
            return Response(
                {'error': 'Выберите либо готовый аватар, либо загрузите свой'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if avatar_id:
            try:
                avatar = Avatar.objects.get(id=avatar_id, is_active=True)
            except Avatar.DoesNotExist:
                return Response(
                    {'error': 'Аватар не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )

            user.avatar_default = avatar
            user.avatar = None
            user.save(update_fields=['avatar', 'avatar_default'])

            return Response({
                'status': 'ok',
                'type': 'default',
                'user': UserSerializer(user, context={'request': request}).data,
            })

        if avatar_file:
            user.avatar = avatar_file
            user.avatar_default = None
            user.save(update_fields=['avatar', 'avatar_default'])

            return Response({
                'status': 'ok',
                'type': 'custom',
                'user': UserSerializer(user, context={'request': request}).data,
            })

        return Response(
            {'error': 'Нужно передать avatar_id или avatar'},
            status=status.HTTP_400_BAD_REQUEST
        )
