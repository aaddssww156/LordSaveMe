from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        'email',
        'first_name',
        'last_name',
        'city',
        'phone_number',
        'is_moderator_display',
        'is_admin_display'
    )
    list_filter = ('groups', 'city')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    actions = ['delete_selected_users']

    def is_moderator_display(self, obj):
        return obj.is_moderator()
    is_moderator_display.boolean = True
    is_moderator_display.short_description = 'Moderator'

    def is_admin_display(self, obj):
        return obj.is_admin()
    is_admin_display.boolean = True
    is_admin_display.short_description = 'Admin'

    def delete_selected_users(self, request, queryset):
        for user in queryset:
            user.requests.all().delete()
            user.delete()
    delete_selected_users.short_description = "Delete selected users and their requests"