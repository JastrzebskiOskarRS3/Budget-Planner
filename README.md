# 💰 BudgetPlanner

Aplikacja webowa do zarządzania budżetem osobistym. Backend oparty na Flask (Python) z REST API, frontend renderowany po stronie klienta (CSR) w vanilla JavaScript.

---

## ✨ Funkcje

- **Dashboard** — przegląd przychodów, wydatków i salda dla wybranego miesiąca
- **Przegląd miesięcy** — zestawienie finansów z podziałem na miesiące
- **Wszystkie transakcje** — lista z filtrowaniem po typie i kategorii
- **Statystyki** — podsumowanie roczne i rozkład wydatków według kategorii
- Dodawanie, edytowanie i usuwanie transakcji
- 10 wbudowanych kategorii (jedzenie, mieszkanie, transport, zdrowie i inne)
- Walidacja danych po stronie serwera
- Powiadomienia o sukcesie / błędzie w UI

---

## 🛠 Stos technologiczny

| Warstwa | Technologia |
|---|---|
| Backend | Python 3, Flask, Flask-CORS, SQLAlchemy |
| Baza danych | SQLite |
| Frontend | Vanilla JavaScript (CSR), HTML5, CSS3 |
| Ikony | Font Awesome 6 |
| Czcionki | Inter (Google Fonts) |

---

## 📁 Struktura projektu

```
budgetplanner/
├── app.py              # Punkt wejścia, routing Flask
├── controllers.py      # Logika biznesowa, obsługa requestów
├── models.py           # Modele SQLAlchemy (Transaction, Category)
├── database.py         # Inicjalizacja DB i seed kategorii
├── static/
│   └── client.js       # Frontend (CSR) — cały interfejs i logika UI
└── templates/
    ├── index.html
    └── partials/
        ├── header.html
        ├── sidebar.html
        └── footer.html
```

---

## 🚀 Uruchomienie lokalne

### Wymagania

- Python 3.8+
- pip

### Instalacja

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/twoj-username/budgetplanner.git
cd budgetplanner

# 2. Utwórz i aktywuj środowisko wirtualne
python -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows

# 3. Zainstaluj zależności
pip install flask flask-cors flask-sqlalchemy

# 4. Uruchom aplikację
python app.py
```

Aplikacja będzie dostępna pod adresem: **http://localhost:5000**

Baza danych `budget.db` zostanie utworzona automatycznie przy pierwszym uruchomieniu wraz z domyślnymi kategoriami.

---

## 🔌 REST API

Bazowy URL: `http://localhost:5000/api`

### Transakcje

| Metoda | Endpoint | Opis |
|---|---|---|
| `GET` | `/transactions` | Pobierz wszystkie transakcje |
| `GET` | `/transactions/:id` | Pobierz transakcję po ID |
| `POST` | `/transactions` | Utwórz nową transakcję |
| `PUT` | `/transactions/:id` | Zaktualizuj transakcję |
| `DELETE` | `/transactions/:id` | Usuń transakcję |

### Kategorie

| Metoda | Endpoint | Opis |
|---|---|---|
| `GET` | `/categories` | Pobierz wszystkie kategorie |

### Przykładowe body (POST /transactions)

```json
{
  "description": "Wynagrodzenie",
  "amount": 5000,
  "date": "2025-01-15",
  "category_id": 1
}
```

---

## 🗂 Kategorie domyślne

| ID | Nazwa | Typ |
|---|---|---|
| 1 | 💰 Przychód | income |
| 2 | 🛒 Jedzenie | expense |
| 3 | 🏠 Mieszkanie | expense |
| 4 | 🚗 Transport | expense |
| 5 | 🎬 Rozrywka | expense |
| 6 | 🏥 Zdrowie | expense |
| 7 | 📚 Edukacja | expense |
| 8 | 👕 Ubrania | expense |
| 9 | 📱 Rachunki | expense |
| 10 | 🎁 Inne | expense |

---

## 📝 Licencja

MIT
