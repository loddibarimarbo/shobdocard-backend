from rest_framework import serializers
from .models import Language, LanguagePair

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ["code", "name", "native_name", "flag_emoji"]

class LanguagePairSerializer(serializers.ModelSerializer):
    source = LanguageSerializer()
    target = LanguageSerializer()

    class Meta:
        model = LanguagePair
        fields = ["id", "source", "target"]
