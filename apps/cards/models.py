import uuid
from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10, blank=True)
    language_pair = models.ForeignKey(
        "languages.LanguagePair", on_delete=models.CASCADE, related_name="categories"
    )

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return f"{self.emoji} {self.name}"


class Deck(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="decks", null=True, blank=True  # null = system deck
    )
    language_pair = models.ForeignKey("languages.LanguagePair", on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Flashcard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="cards")
    source_text = models.CharField(max_length=500)   # e.g. Bengali: হ্যালো
    target_text = models.CharField(max_length=500)   # e.g. German: Hallo
    romanization = models.CharField(max_length=500, blank=True)  # e.g. ha-lo
    example_sentence_source = models.TextField(blank=True)
    example_sentence_target = models.TextField(blank=True)
    audio_url = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    difficulty = models.PositiveSmallIntegerField(default=1)  # 1-5
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source_text} → {self.target_text}"
