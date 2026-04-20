# শব্দকার্ড — Django Backend

Bengali → German (and beyond) flashcard learning app.

## Stack
- **Django 5** + Django REST Framework
- **PostgreSQL** (primary DB)
- **Redis** + **Celery** (async AI task queue)
- **Claude API** (AI quiz generation)
- **JWT auth** (simplejwt)

## Quick start

```bash
# 1. Clone & set up env
cp .env.example .env
# Fill in SECRET_KEY, DATABASE_URL, ANTHROPIC_API_KEY

# 2. Docker (recommended)
docker-compose up --build

# 3. Or local
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# 4. Run Celery worker (separate terminal)
celery -A config worker -l info
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/token/` | Login → JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| POST | `/api/users/register/` | Register new user |
| GET | `/api/users/me/` | Current user profile |
| GET | `/api/languages/pairs/` | Available language pairs |
| GET/POST | `/api/cards/decks/` | List / create decks |
| GET/POST | `/api/cards/decks/{id}/cards/` | Cards in a deck |
| GET | `/api/progress/summary/` | User stats (streak, XP, etc.) |
| POST | `/api/progress/review/` | Submit card review (SM-2) |
| POST | `/api/ai/generate/` | Generate AI quiz for a card |
| GET | `/api/ai/quiz/{id}/` | Poll quiz generation status |

## Project structure

```
shobdocard/
├── config/
│   ├── settings/
│   │   ├── base.py        # Shared settings
│   │   ├── development.py
│   │   └── production.py
│   └── urls.py
├── apps/
│   ├── users/             # Custom user model + profiles
│   ├── languages/         # Language pairs (BD→DE, BD→EN…)
│   ├── cards/             # Decks + flashcards
│   ├── progress/          # SM-2 SRS + streaks + XP
│   └── ai_quiz/           # Claude-powered quiz generation
├── core/                  # Shared utils, permissions, pagination
├── Dockerfile
└── docker-compose.yml
```

## Deploying to Railway / Render

1. Push to GitHub
2. Create new project → connect repo
3. Add env vars from `.env.example`
4. Add a Redis service
5. Set start command: `gunicorn config.wsgi:application`
6. Run migrations: `python manage.py migrate`
