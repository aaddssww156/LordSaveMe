from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from .models import Request
from .serializers import RequestSerializer, CreateRequestSerializer

class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff

class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'close']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsStaff]
        elif self.action == 'destroy':
            # Разрешаем удаление как админам, так и владельцам запросов
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateRequestSerializer
        return RequestSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            today = timezone.now().date()
            if date_filter == 'today':
                queryset = queryset.filter(created_at__date=today)
            elif date_filter == 'week':
                start_date = today - timedelta(days=today.weekday())
                end_date = start_date + timedelta(days=6)
                queryset = queryset.filter(created_at__date__range=[start_date, end_date])
            elif date_filter == 'month':
                queryset = queryset.filter(created_at__month=today.month, created_at__year=today.year)
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in ['created_at', '-created_at']:
            queryset = queryset.order_by(ordering)
        return queryset.prefetch_related('files')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if request.user == instance.user or request.user.is_staff:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        return Response(
            {"detail": "You don't have permission to delete this request"},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def close(self, request, pk=None):
        request_instance = self.get_object()
        if request_instance.user != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You can only close your own requests"},
                status=status.HTTP_403_FORBIDDEN
            )
        request_instance.status = 'closed'
        request_instance.save()
        return Response({'status': 'request closed'}, status=status.HTTP_200_OK)