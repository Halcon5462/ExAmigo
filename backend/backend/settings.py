from pathlib import Path
from datetime import timedelta
import os

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

SECRET_KEY = 'django-insecure-06#!@fkg#*&@_ubc_pe#m)!p(q*y#-m7)iqi2-^urydh(c!2mu'
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in {"1", "true", "yes", "on"}
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    "daphne",
    "channels",
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'account',
    'achievements',
    'task_bank',
    'shop',
    'statistic',
    'products.apps.ProductsConfig',
    'tools',
    'streak',
    'competitions',
    'help_ai',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'backend.logging_middleware.RequestLoggingMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========== НАШИ НАСТРОЙКИ ==========
AUTH_USER_MODEL = 'account.UserAccount'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

ASGI_APPLICATION = "backend.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "info_only": {
            "()": "backend.logging_filters.ExactLevelFilter",
            "level_name": "INFO",
        },
        "warning_only": {
            "()": "backend.logging_filters.ExactLevelFilter",
            "level_name": "WARNING",
        },
        "error_only": {
            "()": "backend.logging_filters.ExactLevelFilter",
            "level_name": "ERROR",
        },
    },
    "formatters": {
        "verbose": {
            "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "info_file": {
            "class": "logging.FileHandler",
            "filename": LOG_DIR / "info.log",
            "level": "INFO",
            "filters": ["info_only"],
            "formatter": "verbose",
            "encoding": "utf-8",
        },
        "warning_file": {
            "class": "logging.FileHandler",
            "filename": LOG_DIR / "warning.log",
            "level": "WARNING",
            "filters": ["warning_only"],
            "formatter": "verbose",
            "encoding": "utf-8",
        },
        "error_file": {
            "class": "logging.FileHandler",
            "filename": LOG_DIR / "error.log",
            "level": "ERROR",
            "filters": ["error_only"],
            "formatter": "verbose",
            "encoding": "utf-8",
        },
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["info_file", "warning_file", "error_file", "console"],
            "level": "INFO",
            "propagate": True,
        },
        "backend.request": {
            "handlers": ["info_file", "warning_file", "error_file", "console"],
            "level": "INFO",
            "propagate": False,
        },
        "backend.security": {
            "handlers": ["info_file", "warning_file", "error_file", "console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
