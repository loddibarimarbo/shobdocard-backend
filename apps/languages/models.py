from django.db import models

class Language(models.Model):
    code = models.CharField(max_length=10, unique=True)  # e.g. "bn", "de", "en"
    name = models.CharField(max_length=100)              # e.g. "Bengali"
    native_name = models.CharField(max_length=100)       # e.g. "বাংলা"
    flag_emoji = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class LanguagePair(models.Model):
    source = models.ForeignKey(Language, on_delete=models.CASCADE, related_name="as_source")
    target = models.ForeignKey(Language, on_delete=models.CASCADE, related_name="as_target")
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("source", "target")

    def __str__(self):
        return f"{self.source.code} → {self.target.code}"
