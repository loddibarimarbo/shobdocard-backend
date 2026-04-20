from rest_framework import serializers
from .models import Deck, Flashcard, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "emoji"]

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = [
            "id", "source_text", "target_text", "romanization",
            "example_sentence_source", "example_sentence_target",
            "audio_url", "image_url", "difficulty", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

class DeckSerializer(serializers.ModelSerializer):
    card_count = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Deck
        fields = ["id", "name", "description", "language_pair", "category", "is_public", "card_count", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_card_count(self, obj):
        return obj.cards.count()
