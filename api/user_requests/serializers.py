from rest_framework import serializers
from .models import Request, RequestFile
from account.serializers import UserSerializer

class RequestFileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()

    class Meta:
        model = RequestFile
        fields = ['id', 'file', 'name', 'uploaded_at', 'url', 'preview']

    def get_name(self, obj):
        return obj.file.name.split('/')[-1]
    
    def get_url(self, obj):
        return obj.file.url
    
    def get_preview(self, obj):
        if obj.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
            return obj.file.url
        return None

class RequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    files = RequestFileSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = [
            'id',
            'user',
            'title',
            'description',
            'status',
            'status_display',
            'created_at',
            'updated_at',
            'files',
            'admin_response'
        ]
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'updated_at',
            'status_display',
            'files'
        ]

class CreateRequestSerializer(serializers.ModelSerializer):
    files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Request
        fields = ['title', 'description', 'files']

    def create(self, validated_data):
        files = validated_data.pop('files', [])
        request = Request.objects.create(**validated_data)
        for file in files:
            RequestFile.objects.create(request=request, file=file)
        return request