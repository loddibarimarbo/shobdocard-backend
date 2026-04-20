import uuid
from django.db import models
from django.conf import settings

class CardProgress(models.Model):
    """SM-2 spaced repetition state per user per card."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="card_progress")
    card = models.ForeignKey("cards.Flashcard", on_delete=models.CASCADE, related_name="progress")

    # SM-2 fields
    ease_factor = models.FloatField(default=2.5)
    interval = models.PositiveIntegerField(default=1)   # days
    repetitions = models.PositiveIntegerField(default=0)
    next_review = models.DateField(auto_now_add=True)
    last_reviewed = models.DateTimeField(null=True, blank=True)

    # Stats
    times_correct = models.PositiveIntegerField(default=0)
    times_incorrect = models.PositiveIntegerField(default=0)
    is_mastered = models.BooleanField(default=False)

    class Meta:
        unique_together = ("user", "card")

    def __str__(self):
        return f"{self.user.email} / {self.card}"

    def update_sm2(self, quality: int):
        """Update SM-2 state. quality: 0-5 (0-2=fail, 3-5=pass)."""
        if quality < 3:
            self.repetitions = 0
            self.interval = 1
            self.times_incorrect += 1
        else:
            if self.repetitions == 0:
                self.interval = 1
            elif self.repetitions == 1:
                self.interval = 6
            else:
                self.interval = round(self.interval * self.ease_factor)
            self.repetitions += 1
            self.ease_factor = max(
                1.3,
                self.ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
            )
            self.times_correct += 1

        from core.utils import days_from_now
        from django.utils import timezone
        self.next_review = days_from_now(self.interval).date()
        self.last_reviewed = timezone.now()
        self.is_mastered = self.interval >= 21
        self.save()


class StudySession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions")
    deck = models.ForeignKey("cards.Deck", on_delete=models.CASCADE, related_name="sessions")
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    cards_studied = models.PositiveIntegerField(default=0)
    correct = models.PositiveIntegerField(default=0)
    incorrect = models.PositiveIntegerField(default=0)

    @property
    def accuracy(self):
        total = self.correct + self.incorrect
        return round((self.correct / total) * 100, 1) if total else 0


class Badge(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    emoji = models.CharField(max_length=10, blank=True)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, through="UserBadge", related_name="badges")


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "badge")
