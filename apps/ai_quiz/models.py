import uuid
from django.db import models
from django.conf import settings

class GeneratedQuiz(models.Model):
    QUIZ_TYPES = [
        ("fill_blank", "Fill in the blank"),
        ("mcq", "Multiple choice"),
        ("sentence", "Full sentence"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("done", "Done"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quizzes")
    card = models.ForeignKey("cards.Flashcard", on_delete=models.CASCADE, related_name="quizzes", null=True, blank=True)
    deck = models.ForeignKey("cards.Deck", on_delete=models.CASCADE, related_name="quizzes", null=True, blank=True)
    quiz_type = models.CharField(max_length=20, choices=QUIZ_TYPES, default="fill_blank")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    prompt_used = models.TextField(blank=True)
    result_json = models.JSONField(null=True, blank=True)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.quiz_type} quiz for {self.user.email}"
