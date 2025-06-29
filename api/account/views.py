from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import UserSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        if user_id:
            user = CustomUser.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request, user_id=None):
        if user_id and user_id != request.user.id and not request.user.is_admin():
            return Response({"error": "You can only edit your own profile"}, status=403)
        
        user = request.user if not user_id else CustomUser.objects.get(id=user_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        if not user.check_password(request.data.get('current_password')):
            return Response({"detail": "Wrong password"}, status=400)
        user.delete()
        return Response(status=204)