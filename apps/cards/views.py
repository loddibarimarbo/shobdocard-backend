from rest_framework import viewsets, permissions
from core.permissions import IsOwner
from .models import Deck, Flashcard, Category
from .serializers import DeckSerializer, FlashcardSerializer, CategorySerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class DeckViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Deck.objects.filter(
            owner=self.request.user
        ) | Deck.objects.filter(is_public=True, owner__isnull=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class FlashcardViewSet(viewsets.ModelViewSet):
    serializer_class = FlashcardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        deck_id = self.kwargs.get("deck_pk")
        return Flashcard.objects.filter(deck_id=deck_id)
