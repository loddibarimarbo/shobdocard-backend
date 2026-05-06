from django.urls import path
from .views import GenerateQuizView, QuizStatusView, RandomQuizView

urlpatterns = [
    path("generate/", GenerateQuizView.as_view(), name="ai-generate"),
    path("quiz/<uuid:quiz_id>/", QuizStatusView.as_view(), name="ai-quiz-status"),
    path("random/", RandomQuizView.as_view(), name="ai-random-quiz"),
]