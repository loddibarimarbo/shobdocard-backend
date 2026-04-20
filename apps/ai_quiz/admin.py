from django.contrib import admin
from .models import GeneratedQuiz

@admin.register(GeneratedQuiz)
class GeneratedQuizAdmin(admin.ModelAdmin):
    list_display = ["user", "quiz_type", "status", "card", "created_at", "completed_at"]
    list_filter = ["status", "quiz_type"]
    search_fields = ["user__email"]
    readonly_fields = ["prompt_used", "result_json", "error", "created_at", "completed_at"]