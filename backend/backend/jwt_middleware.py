from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from jwt import DecodeError
from jwt import decode as jwt_decode
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken

User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Поддержка JWT из query string ?token=<ACCESS_TOKEN>
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        token_list = parse_qs(query_string).get("token")

        if token_list:
            token = token_list[0]

            try:
                UntypedToken(token)
                decoded_data = jwt_decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"],
                )

                user_id = decoded_data.get("user_id")
                user = await database_sync_to_async(User.objects.get)(id=user_id)
                scope["user"] = user

            except (
                InvalidToken,
                TokenError,
                DecodeError,
                ObjectDoesNotExist,
            ):
                scope["user"] = AnonymousUser()

        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
