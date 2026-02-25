from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserAccount, UserAchievement, Achievement

class UserAccountAdmin(UserAdmin):
    list_display = ('email', 'name', 'is_staff', 'is_active')
    search_fields = ('email', 'name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'name', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'get_date')
    search_fields = ('user__email', 'achievement__name')

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'target', 'reward')
    search_fields = ('name',)

admin.site.register(UserAccount, UserAccountAdmin)