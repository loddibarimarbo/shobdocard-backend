from django.utils import timezone

def now():
    return timezone.now()

def days_from_now(n: int):
    from datetime import timedelta
    return now() + timedelta(days=n)
