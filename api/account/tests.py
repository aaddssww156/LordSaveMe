from django.test import TestCase
from rest_framework.test import APITestCase
from account.models import CustomUser
from account.serializers import UserCreateSerializer, UserSerializer
from rest_framework import status
from django.urls import reverse
from django.core.exceptions import ValidationError

class CustomUserModelTest(TestCase):
    def test_valid_phone_creation(self):
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='password123',
            phone_number='1234567890'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.phone_number, '1234567890')
        self.assertTrue(user.check_password('password123'))

    def test_invalid_phone_validation(self):
        for bad in ['12345', '12345678901', 'abcdefghij']:
            u = CustomUser(email=f'bad{bad}@example.com', phone_number=bad)
            with self.assertRaises(ValidationError):
                u.full_clean()

    def test_phone_format_method(self):
        user = CustomUser.objects.create_user(
            email='fmt@example.com',
            password='pass123',
            phone_number='1234567890'
        )
        fmt = user.get_formatted_phone()
        self.assertEqual(fmt, '(123) 456-7890')

class UserSerializerTest(APITestCase):
    def test_create_valid(self):
        data = {
            'email': 'new@example.com',
            'password': 'password123',
            'first_name': 'A',
            'last_name': 'B',
            'phone_number': '1234567890'
        }
        s = UserCreateSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)
        u = s.save()
        self.assertEqual(u.phone_number, '1234567890')

    def test_create_invalid_phone(self):
        data = {
            'email': 'x@example.com',
            'password': 'password123',
            'phone_number': '123'
        }
        s = UserCreateSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('phone_number', s.errors)

    def test_serialize_phone_format(self):
        user = CustomUser.objects.create_user(
            email='srv@example.com',
            password='pwd',
            phone_number='1234567890'
        )
        s = UserSerializer(user)
        self.assertEqual(s.data.get('phone_number'), '(123) 456-7890')

class ProfileViewTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='testp@example.com',
            password='password',
            phone_number='1234567890'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_profile_phone(self):
        url = reverse('profile')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get('phone_number'), '(123) 456-7890')

class CustomViewTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='testc@example.com',
            password='password',
            phone_number='1234567890'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_custom(self):
        url = reverse('custom_view')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get('user'), 'testc@example.com')

    def test_post_custom(self):
        url = reverse('custom_view')
        data = {'key': 'value'}
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get('data'), data)
