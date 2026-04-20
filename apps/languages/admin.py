from django.contrib import admin
from .models import Language, LanguagePair

@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "native_name", "flag_emoji"]
    search_fields = ["code", "name"]

@admin.register(LanguagePair)
class LanguagePairAdmin(admin.ModelAdmin):
    list_display = ["__str__", "source", "target", "is_active"]
    list_filter = ["is_active"]