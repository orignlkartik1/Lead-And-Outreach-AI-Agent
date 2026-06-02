# Backend - Auth Service

Minimal Flask auth service for Signup/Login using MongoDB, bcrypt and JWT.

Quick start

1. Create venv and install deps:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and customize.

3. Run the app:

```bash
python app.py
```

Endpoints

- `POST /signup` — body: `{name, email, password}`
- `POST /login` — body: `{email, password}`
- `GET /me` — protected; requires `Authorization: Bearer <token>`

Postman examples: `postman_collection.json`
