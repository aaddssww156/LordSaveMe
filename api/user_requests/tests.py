from django.test import TestCase
from rest_framework.test import APITestCase
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from account.models import CustomUser
from .models import Request, RequestFile
from user_requests.serializers import RequestSerializer

class RequestModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(email='u@example.com', password='pass')
    def test_valid_and_invalid(self):
        r = Request.objects.create(user=self.user, title='T', description='D', status='pending')
        self.assertEqual(str(r), 'T')
        r2 = Request(user=self.user, title='X', description='D', status='bad')
        with self.assertRaises(ValidationError):
            r2.full_clean()

class RequestSerializerTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(email='u2@example.com', password='pass')
        self.req = Request.objects.create(user=self.user, title='T', description='D', status='pending')
        RequestFile.objects.create(request=self.req, file='f.txt')
    def test_serializer_files(self):
        data = RequestSerializer(self.req).data
        names = [f['name'] for f in data.get('files', [])]
        self.assertIn('f.txt', names)

class RequestViewTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(email='u3@example.com', password='pass')
        self.mod = CustomUser.objects.create_user(email='mod@example.com', password='pass')
        g = Group.objects.create(name='Moderators')
        self.mod.groups.add(g)
        self.req = Request.objects.create(user=self.user, title='R1', description='D', status='pending')
    def test_list_requires_auth(self):
        self.assertEqual(self.client.get(reverse('request-list')).status_code, status.HTTP_401_UNAUTHORIZED)
    def test_user_list_and_create(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(reverse('request-list'))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        resp2 = self.client.post(reverse('request-list'), {'title': 'N', 'description': 'D'})
        self.assertEqual(resp2.status_code, status.HTTP_201_CREATED)
    def test_update_forbidden_and_allowed(self):
        self.client.force_authenticate(user=self.user)
        other = Request.objects.create(user=self.mod, title='R2', description='D', status='pending')
        self.assertEqual(self.client.patch(reverse('request-detail', args=[other.id]), {'title': 'X'}).status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.patch(reverse('request-detail', args=[self.req.id]), {'title': 'New'}).status_code, status.HTTP_200_OK)
    def test_delete_mod(self):
        self.client.force_authenticate(user=self.mod)
        self.assertEqual(self.client.delete(reverse('request-detail', args=[self.req.id])).status_code, status.HTTP_204_NO_CONTENT)