from django.urls import path
from .views import ProductViewSet, CategoryViewSet

urlpatterns = [
    path('products/', ProductViewSet.as_view({'get': 'list'}), name='product-list'),
    path('products/<int:pk>/', ProductViewSet.as_view({'get': 'retrieve'}), name='product-detail'),
    path('categories/', CategoryViewSet.as_view({'get': 'list'}), name='category-list'),
]