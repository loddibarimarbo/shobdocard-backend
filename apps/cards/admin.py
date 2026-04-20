from django.contrib import admin
from .models import Category, Deck, Flashcard

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "emoji", "language_pair"]
    search_fields = ["name"]

class FlashcardInline(admin.TabularInline):
    model = Flashcard
    extra = 0
    fields = ["source_text", "target_text", "romanization", "difficulty"]

@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ["name", "language_pair", "category", "owner", "is_public", "created_at"]
    list_filter = ["is_public", "language_pair"]
    search_fields = ["name", "owner__email"]
    inlines = [FlashcardInline]

@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ["source_text", "target_text", "romanization", "deck", "difficulty"]
    list_filter = ["difficulty", "deck__language_pair"]
    search_fields = ["source_text", "target_text"]