from rest_framework import viewsets, permissions
from .models import LanguagePair
from .serializers import LanguagePairSerializer

class LanguagePairViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LanguagePairSerializer
    permission_classes = [permissions.AllowAny]
    queryset = LanguagePair.objects.filter(is_active=True).select_related("source", "target")
