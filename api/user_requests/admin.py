from django.contrib import admin
from django.utils.html import format_html
from .models import Request, RequestFile

class RequestFileInline(admin.TabularInline):
    model = RequestFile
    extra = 0
    readonly_fields = ['file_preview']
    
    def file_preview(self, obj):
        if obj.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
            return format_html('<img src="{}" height="50" />', obj.file.url)
        return "Preview not available"
    file_preview.short_description = "Preview"

@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'created_at', 'show_thumbnail', 'files_count')
    list_filter = ('status', 'created_at', 'user__email')
    search_fields = ('title', 'user__email', 'description')
    inlines = [RequestFileInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('files')
    
    def show_thumbnail(self, obj):
        first_file = obj.files.first()
        if first_file and first_file.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
            return format_html('<img src="{}" height="50" />', first_file.file.url)
        return "No image"
    show_thumbnail.short_description = "Thumbnail"
    
    def files_count(self, obj):
        return obj.files.count()
    files_count.short_description = "Files"

    actions = [
        'mark_as_in_progress',
        'mark_as_completed',
        'mark_as_rejected',
        'mark_as_closed'
    ]

    def mark_as_in_progress(self, request, queryset):
        queryset.update(status='in_progress')
    mark_as_in_progress.short_description = "Mark as in progress"

    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = "Mark as completed"

    def mark_as_rejected(self, request, queryset):
        queryset.update(status='rejected')
    mark_as_rejected.short_description = "Mark as rejected"

    def mark_as_closed(self, request, queryset):
        queryset.update(status='closed')
    mark_as_closed.short_description = "Mark as closed"

@admin.register(RequestFile)
class RequestFileAdmin(admin.ModelAdmin):
    list_display = ('request', 'file_preview', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('request__title',)
    
    def file_preview(self, obj):
        if obj.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
            return format_html('<img src="{}" height="50" />', obj.file.url)
        return obj.file.name
    file_preview.short_description = "Preview"