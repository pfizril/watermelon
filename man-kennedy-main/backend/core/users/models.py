from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    theme_preference = models.CharField(max_length=20, default='light')
    notification_enabled = models.BooleanField(default=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email 