from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from .models import CardProgress, StudySession

class ProgressSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        progress_qs = CardProgress.objects.filter(user=user)
        today = timezone.now().date()

        return Response({
            "cards_studied": progress_qs.filter(last_reviewed__isnull=False).count(),
            "correct": sum(p.times_correct for p in progress_qs),
            "incorrect": sum(p.times_incorrect for p in progress_qs),
            "mastered": progress_qs.filter(is_mastered=True).count(),
            "due_today": progress_qs.filter(next_review__lte=today).count(),
            "accuracy": _accuracy(progress_qs),
            "current_streak": getattr(user.profile, "current_streak", 0),
            "xp_points": getattr(user.profile, "xp_points", 0),
        })

def _accuracy(qs):
    correct = sum(p.times_correct for p in qs)
    total = correct + sum(p.times_incorrect for p in qs)
    return round((correct / total) * 100, 1) if total else 0


class ReviewCardView(APIView):
    """POST {card_id, quality: 0-5} → updates SM-2, returns next_review date."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        card_id = request.data.get("card_id")
        quality = int(request.data.get("quality", 0))

        if not card_id or quality not in range(6):
            return Response({"error": "card_id and quality (0-5) required"}, status=400)

        cp, _ = CardProgress.objects.get_or_create(
            user=request.user, card_id=card_id,
            defaults={"ease_factor": 2.5, "interval": 1, "repetitions": 0},
        )
        cp.update_sm2(quality)

        # XP
        if quality >= 3 and hasattr(request.user, "profile"):
            request.user.profile.xp_points += 10
            request.user.profile.save(update_fields=["xp_points"])

        return Response({
            "next_review": cp.next_review,
            "interval_days": cp.interval,
            "is_mastered": cp.is_mastered,
        })
