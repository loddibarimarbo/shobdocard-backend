from django.core.management.base import BaseCommand
from apps.languages.models import Language, LanguagePair
from apps.cards.models import Category, Deck, Flashcard


FLASHCARDS = {
    "Greetings": [
        ("হ্যালো", "Hallo", "ha-lo"),
        ("ধন্যবাদ", "Danke", "dan-ke"),
        ("অনুগ্রহ করে", "Bitte", "bi-te"),
        ("হ্যাঁ", "Ja", "ya"),
        ("না", "Nein", "nine"),
        ("শুভ সকাল", "Guten Morgen", "goo-ten mor-gen"),
        ("শুভ রাত্রি", "Gute Nacht", "goo-te nakht"),
        ("কেমন আছেন?", "Wie geht es Ihnen?", "vee gayt es ee-nen"),
        ("আমি ভালো আছি", "Mir geht es gut", "meer gayt es goot"),
        ("বিদায়", "Auf Wiedersehen", "owf vee-der-zayn"),
    ],
    "Numbers": [
        ("এক", "Eins", "ains"),
        ("দুই", "Zwei", "tsvai"),
        ("তিন", "Drei", "drai"),
        ("চার", "Vier", "feer"),
        ("পাঁচ", "Fünf", "fuenf"),
    ],
    "Food & Drink": [
        ("পানি", "Wasser", "va-ser"),
        ("রুটি", "Brot", "broht"),
        ("ডিম", "Ei", "ai"),
    ],
    "Family": [
        ("মা", "Mutter", "mu-ter"),
        ("বাবা", "Vater", "fah-ter"),
    ],
    "Daily Life": [
        ("বাড়ি", "Haus", "hows"),
        ("স্কুল", "Schule", "shoo-le"),
    ],
}

CATEGORY_EMOJIS = {
    "Greetings": "👋",
    "Numbers": "🔢",
    "Food & Drink": "🍔",
    "Family": "👨‍👩‍👧",
    "Daily Life": "🏠",
}


class Command(BaseCommand):
    help = "Seed initial language pairs, categories, and flashcards"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding languages...")

        bn, _ = Language.objects.get_or_create(
            code="bn",
            defaults={"name": "Bengali", "native_name": "বাংলা", "flag_emoji": "🇧🇩"},
        )
        de, _ = Language.objects.get_or_create(
            code="de",
            defaults={"name": "German", "native_name": "Deutsch", "flag_emoji": "🇩🇪"},
        )
        en, _ = Language.objects.get_or_create(
            code="en",
            defaults={"name": "English", "native_name": "English", "flag_emoji": "🇬🇧"},
        )
        fr, _ = Language.objects.get_or_create(
            code="fr",
            defaults={"name": "French", "native_name": "Français", "flag_emoji": "🇫🇷"},
        )

        self.stdout.write("Seeding language pairs...")
        bn_de, _ = LanguagePair.objects.get_or_create(source=bn, target=de)
        LanguagePair.objects.get_or_create(source=bn, target=en)
        LanguagePair.objects.get_or_create(source=bn, target=fr)

        self.stdout.write("Seeding categories and flashcards...")
        total_cards = 0

        for cat_name, cards in FLASHCARDS.items():
            category, _ = Category.objects.get_or_create(
                name=cat_name,
                language_pair=bn_de,
                defaults={"emoji": CATEGORY_EMOJIS.get(cat_name, "")},
            )

            deck, _ = Deck.objects.get_or_create(
                name=cat_name,
                language_pair=bn_de,
                defaults={
                    "description": f"{cat_name} vocabulary — Bengali to German",
                    "category": category,
                    "is_public": True,
                    "owner": None,
                },
            )

            for source, target, roman in cards:
                card, created = Flashcard.objects.get_or_create(
                    deck=deck,
                    source_text=source,
                    defaults={
                        "target_text": target,
                        "romanization": roman,
                        "difficulty": 1,
                    },
                )
                if created:
                    total_cards += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Seeded:\n"
            f"  4 languages (Bengali, German, English, French)\n"
            f"  3 language pairs (BD->DE, BD->EN, BD->FR)\n"
            f"  {len(FLASHCARDS)} categories\n"
            f"  {len(FLASHCARDS)} decks\n"
            f"  {total_cards} flashcards\n"
        ))