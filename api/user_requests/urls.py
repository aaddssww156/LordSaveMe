from django.urls import path
from .views import RequestViewSet

request_viewset = RequestViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

urlpatterns = [
    path('', request_viewset, name='request-list'),
    path('<int:pk>/', RequestViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='request-detail'),
    path('<int:pk>/close/', RequestViewSet.as_view({'patch': 'close'}), name='request-close'),
]