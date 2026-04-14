import logging
import time


class RequestLoggingMiddleware:
    """Регистрирует каждый HTTP-запрос/ответ с указанием продолжительности и контекста пользователя."""

    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger("backend.request")
        self.security_logger = logging.getLogger("backend.security")

    def __call__(self, request):
        start_time = time.monotonic()
        method = request.method
        path = request.get_full_path()
        client_ip = self._get_client_ip(request)
        user_id = self._get_user_id(request)

        try:
            response = self.get_response(request)
        except Exception:
            duration_ms = int((time.monotonic() - start_time) * 1000)
            self.security_logger.exception(
                "Unhandled exception | method=%s path=%s user=%s ip=%s duration_ms=%s",
                method,
                path,
                user_id,
                client_ip,
                duration_ms,
            )
            raise

        duration_ms = int((time.monotonic() - start_time) * 1000)
        status_code = response.status_code
        message = (
            "HTTP request | method=%s path=%s status=%s user=%s ip=%s duration_ms=%s"
        )
        params = (method, path, status_code, user_id, client_ip, duration_ms)

        if status_code >= 500:
            self.logger.error(message, *params)
        elif status_code >= 400:
            self.logger.warning(message, *params)
        else:
            self.logger.info(message, *params)

        return response

    @staticmethod
    def _get_user_id(request):
        if hasattr(request, "user") and request.user.is_authenticated:
            return request.user.id
        return "anonymous"

    @staticmethod
    def _get_client_ip(request):
        forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "unknown")
