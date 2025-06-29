from django.db import models
from django.conf import settings
from django.utils import timezone

class Request(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('closed', 'Closed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='requests'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    admin_response = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

class RequestFile(models.Model):
    request = models.ForeignKey(Request, related_name='files', on_delete=models.CASCADE)
    file = models.FileField(upload_to='request_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)