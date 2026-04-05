from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Avatar, UserAccount


@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


class UserAccountAdmin(UserAdmin):
    list_display = ('email', 'name', 'avatar_default', 'is_staff', 'is_active')
    search_fields = ('email', 'name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'name', 'password', 'avatar', 'avatar_default')}),
        (
            'Permissions',
            {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')},
        ),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': (
                    'email',
                    'name',
                    'password1',
                    'password2',
                    'avatar',
                    'avatar_default',
                    'is_staff',
                    'is_active',
                ),
            },
        ),
    )


admin.site.register(UserAccount, UserAccountAdmin)
