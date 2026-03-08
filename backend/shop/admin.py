from django.contrib import admin
from .models import UserWallet, WalletTransaction, UserProduct


class WalletTransactionInline(admin.TabularInline):
    model = WalletTransaction
    extra = 0
    readonly_fields = ("amount", "reason", "description", "created_at")
    can_delete = False


class UserProductInline(admin.TabularInline):
    model = UserProduct
    extra = 0
    readonly_fields = ("product", "purchased_at")
    can_delete = False


@admin.register(UserWallet)
class UserWalletAdmin(admin.ModelAdmin):
    list_display = ("user", "balance", "created_at")
    inlines = [WalletTransactionInline]


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("wallet", "amount", "reason", "created_at")
    list_filter = ("reason", "created_at")


@admin.register(UserProduct)
class UserProductAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "purchased_at")
    list_filter = ("purchased_at",)
    search_fields = ("user__email", "user__name", "product__name")
    autocomplete_fields = ("product",)
    readonly_fields = ("purchased_at",)