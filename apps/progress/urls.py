from django.urls import path
from .views import ProgressSummaryView, ReviewCardView

urlpatterns = [
    path("summary/", ProgressSummaryView.as_view(), name="progress-summary"),
    path("review/", ReviewCardView.as_view(), name="review-card"),
]
