from django.urls import path
from .views import GenerateQuizView, QuizStatusView

urlpatterns = [
    path("generate/", GenerateQuizView.as_view(), name="ai-generate"),
    path("quiz/<uuid:quiz_id>/", QuizStatusView.as_view(), name="ai-quiz-status"),
]
