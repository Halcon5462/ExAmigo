from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/account/', include('account.urls')),
    path('api/achievements/', include('achievements.urls')),
    path('api/taskBank/', include('taskBank.urls')),
    path('api/shop/', include('shop.urls')),
    path('api/products/', include('products.urls')),
    path('api/tools/', include('tools.urls')),
    path('api/streak/', include('streak.urls')),
    path("api/match/", include("competitions.urls")),
    path('api/statistic/', include('statistic.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
