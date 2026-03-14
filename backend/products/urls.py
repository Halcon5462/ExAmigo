from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EquippedItemsView, EquipProductView, ProductViewSet

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")

urlpatterns = [
    path("equip/", EquipProductView.as_view(), name="equip-product"),
    path("equipped/", EquippedItemsView.as_view(), name="equipped-items"),
    path("", include(router.urls)),
]

