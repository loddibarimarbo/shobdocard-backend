from rest_framework.routers import DefaultRouter
from .views import LanguagePairViewSet

router = DefaultRouter()
router.register("pairs", LanguagePairViewSet, basename="language-pair")
urlpatterns = router.urls
