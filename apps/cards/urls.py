from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import DeckViewSet, FlashcardViewSet, CategoryViewSet

router = DefaultRouter()
router.register("decks", DeckViewSet, basename="deck")
router.register("categories", CategoryViewSet, basename="category")

deck_router = routers.NestedDefaultRouter(router, "decks", lookup="deck")
deck_router.register("cards", FlashcardViewSet, basename="deck-cards")

urlpatterns = router.urls + deck_router.urls
