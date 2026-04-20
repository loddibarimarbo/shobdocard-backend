from django.contrib import admin
from .models import CardProgress, StudySession, Badge, UserBadge

@admin.register(CardProgress)
class CardProgressAdmin(admin.ModelAdmin):
    list_display = ["user", "card", "interval", "repetitions", "next_review", "is_mastered"]
    list_filter = ["is_mastered"]
    search_fields = ["user__email", "card__source_text"]

@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ["user", "deck", "cards_studied", "correct", "incorrect", "started_at"]
    search_fields = ["user__email"]

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "emoji"]
    prepopulated_fields = {"slug": ["name"]}

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ["user", "badge", "earned_at"]