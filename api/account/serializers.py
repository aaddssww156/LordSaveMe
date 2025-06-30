from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer, UserSerializer as BaseUserSerializer
from .models import CustomUser

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = CustomUser
        fields = (
            'email',
            'phone_number',
            'city',
            'first_name',
            'last_name',
            'date_of_birth',
            'password'
        )

class UserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = CustomUser
        fields = (
            'id',
            'email',
            'phone_number',
            'city',
            'first_name',
            'last_name',
            'date_of_birth'
        )
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)