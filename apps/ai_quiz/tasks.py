import json
import anthropic
from celery import shared_task
from django.conf import settings
from django.utils import timezone

@shared_task(bind=True, max_retries=3)
def generate_quiz_task(self, quiz_id: str):
    from apps.ai_quiz.models import GeneratedQuiz
    quiz = GeneratedQuiz.objects.get(id=quiz_id)

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

        card = quiz.card
        prompt = (
            f"You are a language learning assistant for Bengali speakers learning {card.deck.language_pair.target.name}.\n"
            f"The word is: {card.target_text} (Bengali: {card.source_text}).\n\n"
            f"Generate a JSON object with:\n"
            f"- sentence: a natural example sentence using '{card.target_text}'\n"
            f"- sentence_bn: Bengali translation of the sentence\n"
            f"- blank_sentence: the sentence with '{card.target_text}' replaced by ___\n"
            f"- options: array of 4 multiple choice options (strings), correct one first\n"
            f"- hint: a short memory tip in Bengali\n\n"
            f"Respond with ONLY valid JSON, no markdown."
        )

        quiz.prompt_used = prompt
        quiz.save(update_fields=["prompt_used"])

        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )

        result = json.loads(message.content[0].text)
        quiz.result_json = result
        quiz.status = "done"
        quiz.completed_at = timezone.now()
        quiz.save()

    except Exception as exc:
        quiz.status = "failed"
        quiz.error = str(exc)
        quiz.save()
        raise self.retry(exc=exc, countdown=10)
