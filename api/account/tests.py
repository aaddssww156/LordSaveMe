from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import Group
from django.urls import reverse

User = get_user_model()

class CustomUserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            phone_number='(123)456-7890'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('password123'))
        self.assertEqual(user.phone_number, '(123)456-7890')

    def test_user_str_representation(self):
        user = User.objects.create_user(email='str_test@example.com')
        self.assertEqual(str(user), 'str_test@example.com')

    def test_is_moderator_method(self):
        user = User.objects.create_user(email='moderator@example.com')
        group = Group.objects.create(name='Moderators')
        user.groups.add(group)
        self.assertTrue(user.is_moderator())

    def test_is_admin_method(self):
        user = User.objects.create_superuser(email='admin@example.com', password='admin123')
        self.assertTrue(user.is_admin())

class CustomUserManagerTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(email='manager@example.com', password='pass123')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        admin = User.objects.create_superuser(email='super@example.com', password='super123')
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

class ProfileViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='profile@test.com',
            password='testpass',
            first_name='John',
            last_name='Doe'
        )
        self.admin = User.objects.create_superuser(
            email='admin@test.com',
            password='adminpass'
        )
        self.profile_url = reverse('profile')
        self.profile_detail_url = reverse('profile-detail', kwargs={'user_id': self.user.id})

    def test_get_own_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@test.com')

    def test_update_own_profile(self):
        self.client.force_authenticate(user=self.user)
        data = {'first_name': 'Updated'}
        response = self.client.patch(self.profile_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')

    def test_admin_can_update_other_profile(self):
        self.client.force_authenticate(user=self.admin)
        data = {'last_name': 'AdminUpdated'}
        response = self.client.patch(self.profile_detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.last_name, 'AdminUpdated')

class DeleteAccountViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='delete@test.com',
            password='password123'
        )
        self.delete_url = reverse('delete-account')
    
    def test_delete_account(self):
        self.client.force_authenticate(user=self.user)
        data = {'current_password': 'password123'}
        response = self.client.delete(self.delete_url, data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(email='delete@test.com').exists())