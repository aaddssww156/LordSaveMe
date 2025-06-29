from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/<int:user_id>/', views.ProfileView.as_view(), name='profile-detail'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete-account'),
]