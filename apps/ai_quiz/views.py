import random
import re
from rest_framework.response import Response
from rest_framework.views import APIView


# German sentence templates by category feel
MCQ_TEMPLATES = [
    "আমি প্রতিদিন ___ ব্যবহার করি।",
    "এটি একটি ___।",
    "___ খুবই গুরুত্বপূর্ণ।",
    "আমার ___ দরকার।",
    "তুমি কি ___ চেনো?",
    "সে ___ পছন্দ করে।",
    "আমরা ___ শিখছি।",
    "এই ___ কোথায়?",
    "জার্মানিতে ___ খুব সাধারণ।",
    "বাংলায় এর মানে কী? ___",
]

FILL_TEMPLATES = [
    "'{source}' জার্মানে বলে: ___",
    "জার্মান ভাষায় '{source}' = ___",
    "'{source}' এর জার্মান অনুবাদ হলো: ___",
    "German word for '{source}': ___",
    "'{source}' কে জার্মানে ___ বলে।",
]

SENTENCE_TEMPLATES = [
    ("Ich brauche {target}.", "আমার {source} দরকার।"),
    ("Das ist {target}.", "এটি {source}।"),
    ("Ich mag {target}.", "আমি {source} পছন্দ করি।"),
    ("Wo ist {target}?", "{source} কোথায়?"),
    ("Ich lerne {target}.", "আমি {source} শিখছি।"),
    ("Er hat {target}.", "তার {source} আছে।"),
    ("Wir haben {target}.", "আমাদের {source} আছে।"),
    ("Sie kauft {target}.", "সে {source} কিনছে।"),
    ("Ich sehe {target}.", "আমি {source} দেখছি।"),
    ("Das ist mein {target}.", "এটি আমার {source}।"),
]

HINTS = {
    # Noun hints
    "der": "পুংলিঙ্গ (der) - নীল রঙে মনে রাখুন",
    "die": "স্ত্রীলিঙ্গ (die) - লাল রঙে মনে রাখুন",
    "das": "নপুংসকলিঙ্গ (das) - সবুজ রঙে মনে রাখুন",
}

MEMORY_TRICKS = [
    "শব্দটি '{romanization}' উচ্চারণ করুন — বারবার বলুন!",
    "'{target}' — উচ্চারণ: {romanization}",
    "মনে রাখুন: বাংলায় '{source}', জার্মানে '{target}'",
    "ছবি কল্পনা করুন: '{source}' দেখলে '{target}' মনে আসবে",
    "'{romanization}' — এভাবে বলুন ৫ বার!",
    "সংযোগ তৈরি করুন: '{source}' → '{target}' ({romanization})",
]

SIMILAR_ENDINGS = {
    "ung": ["Bildung", "Zeitung", "Wohnung", "Meinung", "Lösung"],
    "heit": ["Freiheit", "Schönheit", "Gesundheit", "Einheit"],
    "keit": ["Möglichkeit", "Wirklichkeit", "Fähigkeit"],
    "er": ["Lehrer", "Arbeiter", "Fahrer", "Sprecher"],
    "en": ["Essen", "Trinken", "Gehen", "Schreiben"],
}


def get_smart_distractors(correct_card, all_cards, count=3):
    """Generate intelligent wrong answers"""
    wrong_options = []

    # Strategy 1: Same deck (same category) - harder distractors
    same_deck = [c for c in all_cards if c.get("deck_id") == correct_card.get("deck_id")
                 and c["target_text"] != correct_card["target_text"]]

    # Strategy 2: Similar length words
    correct_len = len(correct_card["target_text"])
    similar_len = [c for c in all_cards
                   if abs(len(c["target_text"]) - correct_len) <= 3
                   and c["target_text"] != correct_card["target_text"]]

    # Strategy 3: Same first letter
    first_letter = correct_card["target_text"][0].lower()
    same_letter = [c for c in all_cards
                   if c["target_text"][0].lower() == first_letter
                   and c["target_text"] != correct_card["target_text"]]

    # Mix strategies
    pool = []
    if same_deck:
        pool.extend(random.sample(same_deck, min(2, len(same_deck))))
    if similar_len:
        pool.extend(random.sample(similar_len, min(2, len(similar_len))))
    if same_letter:
        pool.extend(random.sample(same_letter, min(1, len(same_letter))))

    # Fallback: random
    if len(pool) < count:
        remaining = [c for c in all_cards
                     if c["target_text"] != correct_card["target_text"]
                     and c not in pool]
        pool.extend(random.sample(remaining, min(count - len(pool), len(remaining))))

    # Deduplicate
    seen = set()
    for card in pool:
        if card["target_text"] not in seen:
            seen.add(card["target_text"])
            wrong_options.append(card["target_text"])
        if len(wrong_options) >= count:
            break

    return wrong_options[:count]


def generate_sentence(card):
    """Generate a contextual sentence"""
    template_de, template_bn = random.choice(SENTENCE_TEMPLATES)
    sentence = template_de.replace("{target}", card["target_text"])
    sentence_bn = template_bn.replace("{source}", card["source_text"])
    return sentence, sentence_bn


def generate_hint(card):
    """Generate a smart memory hint"""
    trick = random.choice(MEMORY_TRICKS)
    hint = trick.format(
        source=card["source_text"],
        target=card["target_text"],
        romanization=card.get("romanization", ""),
    )
    return hint


def generate_blank_sentence(card, quiz_type):
    """Generate the question sentence"""
    if quiz_type == "fill_blank":
        template = random.choice(FILL_TEMPLATES)
        return template.format(source=card["source_text"], target=card["target_text"])
    else:
        template = random.choice(MCQ_TEMPLATES)
        return f"'{card['source_text']}' জার্মানে কী বলে?"


class GenerateQuizView(APIView):

    def post(self, request):
        card_id = request.data.get("card_id")
        quiz_type = request.data.get("quiz_type", "both")

        if not card_id:
            return Response({"error": "card_id required"}, status=400)

        try:
            from apps.cards.models import Flashcard
            card_obj = Flashcard.objects.get(id=card_id)
        except Exception:
            return Response({"error": "Card not found"}, status=404)

        card = {
            "id": str(card_obj.id),
            "source_text": card_obj.source_text,
            "target_text": card_obj.target_text,
            "romanization": card_obj.romanization or "",
            "deck_id": str(card_obj.deck_id),
        }

        # Get all cards for distractors
        from apps.cards.models import Flashcard as FC
        all_cards = list(FC.objects.exclude(id=card_obj.id).values(
            "id", "source_text", "target_text", "romanization", "deck_id"
        ))
        for c in all_cards:
            c["id"] = str(c["id"])
            c["deck_id"] = str(c["deck_id"])

        # Pick quiz type
        if quiz_type == "both":
            picked_type = random.choice(["mcq", "fill_blank"])
        else:
            picked_type = quiz_type

        # Generate content
        sentence, sentence_bn = generate_sentence(card)
        blank_sentence = generate_blank_sentence(card, picked_type)
        hint = generate_hint(card)
        wrong_options = get_smart_distractors(card, all_cards, count=3)

        options = [card["target_text"]] + wrong_options

        result = {
            "sentence": sentence,
            "sentence_bn": sentence_bn,
            "blank_sentence": blank_sentence,
            "options": options,
            "hint": hint,
            "quiz_type": picked_type,
            "card": card,
        }

        return Response({
            "quiz_id": card["id"],
            "status": "done",
            "quiz_type": picked_type,
            "result": result,
        })


class QuizStatusView(APIView):
    def get(self, request, quiz_id):
        return Response({"status": "done"})


class RandomQuizView(APIView):
    """Get multiple smart quiz questions at once"""

    def get(self, request):
        count = int(request.query_params.get("count", 10))

        from apps.cards.models import Flashcard
        all_cards = list(Flashcard.objects.all().values(
            "id", "source_text", "target_text", "romanization", "deck_id"
        ))

        if not all_cards:
            return Response({"error": "No cards found"}, status=404)

        for c in all_cards:
            c["id"] = str(c["id"])
            c["deck_id"] = str(c["deck_id"])

        selected = random.sample(all_cards, min(count, len(all_cards)))
        questions = []

        for card in selected:
            quiz_type = random.choice(["mcq", "fill_blank"])
            wrong_options = get_smart_distractors(card, all_cards, count=3)

            options = [card["target_text"]] + wrong_options
            random.shuffle(options)

            sentence, sentence_bn = generate_sentence(card)
            blank_sentence = generate_blank_sentence(card, quiz_type)
            hint = generate_hint(card)

            questions.append({
                "card_id": card["id"],
                "source_text": card["source_text"],
                "target_text": card["target_text"],
                "romanization": card["romanization"],
                "quiz_type": quiz_type,
                "sentence": sentence,
                "sentence_bn": sentence_bn,
                "blank_sentence": blank_sentence,
                "options": options,
                "correct_answer": card["target_text"],
                "hint": hint,
            })

        return Response({"questions": questions, "total": len(questions)})