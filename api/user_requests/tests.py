from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from .models import Request, RequestFile
import os

User = get_user_model()

class RequestModelTest(TestCase):
    def test_create_request(self):
        user = User.objects.create_user(email='user@test.com')
        request = Request.objects.create(
            user=user,
            title='Test Request',
            description='Test description'
        )
        self.assertEqual(request.title, 'Test Request')
        self.assertEqual(request.status, 'pending')
        self.assertEqual(request.user.email, 'user@test.com')

    def test_request_str_representation(self):
        user = User.objects.create_user(email='user@test.com')
        request = Request.objects.create(user=user, title='Test')
        self.assertEqual(str(request), 'Test')

    def test_status_display(self):
        user = User.objects.create_user(email='user@test.com')
        request = Request.objects.create(user=user, title='Test')
        self.assertEqual(request.get_status_display(), 'Pending')

class RequestFileModelTest(TestCase):
    def test_create_request_file(self):
        user = User.objects.create_user(email='user@test.com')
        request = Request.objects.create(user=user, title='Test')
        file = RequestFile.objects.create(
            request=request,
            file=SimpleUploadedFile('test.txt', b'content')
        )
        self.assertEqual(file.request.title, 'Test')
        self.assertIn('test.txt', file.file.name)

class RequestViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@test.com',
            password='testpass'
        )
        self.admin = User.objects.create_superuser(
            email='admin@test.com',
            password='adminpass'
        )
        self.request = Request.objects.create(
            user=self.user,
            title='Test Request',
            description='Test description'
        )

    def test_create_request(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'New Request',
            'description': 'New description',
            'files': [
                SimpleUploadedFile('file1.txt', b'content1'),
                SimpleUploadedFile('file2.txt', b'content2')
            ]
        }
        response = self.client.post(reverse('request-list'), data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Request.objects.count(), 2)
        self.assertEqual(RequestFile.objects.count(), 2)

    def test_list_requests_for_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('request-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Request')

    def test_list_requests_for_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse('request-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_request(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('request-detail', kwargs={'pk': self.request.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Request')

    def test_update_request_by_admin(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('request-detail', kwargs={'pk': self.request.pk})
        data = {'title': 'Updated Title'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.request.refresh_from_db()
        self.assertEqual(self.request.title, 'Updated Title')

    def test_close_request_by_owner(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('request-close', kwargs={'pk': self.request.pk})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.request.refresh_from_db()
        self.assertEqual(self.request.status, 'closed')

    def test_delete_request_by_owner(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('request-detail', kwargs={'pk': self.request.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Request.objects.count(), 0)

    def test_delete_request_by_admin(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('request-detail', kwargs={'pk': self.request.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Request.objects.count(), 0)

    def test_filter_by_status(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('request-list') + '?status=pending'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_ordering(self):
        self.client.force_authenticate(user=self.user)
        Request.objects.create(user=self.user, title='Older Request')
        url = reverse('request-list') + '?ordering=created_at'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['title'], 'Test Request')
        self.assertEqual(response.data[1]['title'], 'Older Request')