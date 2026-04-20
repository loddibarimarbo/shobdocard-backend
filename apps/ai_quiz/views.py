from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import UserRateThrottle
from .models import GeneratedQuiz
from .tasks import generate_quiz_task

class AIGenerateThrottle(UserRateThrottle):
    scope = "ai_generation"

class GenerateQuizView(APIView):
    throttle_classes = [AIGenerateThrottle]

    def post(self, request):
        card_id = request.data.get("card_id")
        quiz_type = request.data.get("quiz_type", "fill_blank")

        if not card_id:
            return Response({"error": "card_id required"}, status=400)

        quiz = GeneratedQuiz.objects.create(
            user=request.user,
            card_id=card_id,
            quiz_type=quiz_type,
            status="pending",
        )

        generate_quiz_task.delay(str(quiz.id))

        return Response({"quiz_id": str(quiz.id), "status": "pending"}, status=202)


class QuizStatusView(generics.RetrieveAPIView):
    def get(self, request, quiz_id):
        try:
            quiz = GeneratedQuiz.objects.get(id=quiz_id, user=request.user)
        except GeneratedQuiz.DoesNotExist:
            return Response(status=404)

        return Response({
            "quiz_id": str(quiz.id),
            "status": quiz.status,
            "quiz_type": quiz.quiz_type,
            "result": quiz.result_json,
            "error": quiz.error or None,
        })
