import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    xp_points = models.PositiveIntegerField(default=0)
    last_study_date = models.DateField(null=True, blank=True)
    preferred_language_pair = models.ForeignKey(
        "languages.LanguagePair",
        null=True, blank=True,
        on_delete=models.SET_NULL
    )

    def __str__(self):
        return f"Profile({self.user.email})"
