# 🍎 Calorie Tracker

Team members:

- Shektybayev Olzhas 24B032113
- Alan Tokin 24B032060

## 📋 Project Description

Calorie Tracker is a web app where users can track what they eat during the day and see how many calories and nutrients they consume. Users can create an account, add meals, and monitor their daily progress based on their personal goals. The app helps people better understand their eating habits in a simple way.

---

## 🚀 Quick Start

### Frontend (Angular)

```bash
cd client
npm install
ng serve
# Open http://localhost:4200
```

### Backend (Django)

```bash
cd server
. venv/Scripts/activate
pip install -r requirements.txt
python manage.py runserver
# API available at http://localhost:8000/api/
```

See [server/SETUP.md](server/SETUP.md) for detailed backend setup instructions.

---

## 📚 Tech Stack

**Frontend:**

- Angular 21
- TypeScript
- RxJS
- Reactive Forms

**Backend:**

- Django 6.0
- Django REST Framework
- JWT (djangorestframework-simplejwt)
- SQLite3

---

## ✅ Features Implemented

### Backend ✓

- [x] User authentication (JWT)
- [x] User profiles with goals
- [x] Product CRUD
- [x] Meal entry tracking
- [x] Daily calorie/nutrient summary
- [x] Admin panel

### Frontend ✓ (Partial)

- [x] Meal tracker form (manual + auto from DB)
- [x] Local storage support
- [ ] Backend API integration (next step)
- [ ] History page (UI ready, needs logic)
- [ ] Login/Register pages

---

## 🔗 API Documentation

See [server/SETUP.md](server/SETUP.md) for full API documentation and examples.

**Quick endpoints:**

- `POST /api/register/` - Register user
- `POST /api/login/` - Login user
- `GET /api/products/` - List products
- `POST /api/entries/` - Add meal entry
- `GET /api/summary/?date=YYYY-MM-DD` - Get daily totals

---

## 📁 Project Structure

```
calorie-tracker/
├── client/          # Angular frontend
│   └── src/app/
│       ├── pages/       (Tracker, History)
│       ├── services/    (CalorieService)
│       └── models/      (Data models)
├── server/          # Django backend
│   ├── api/         (Models, Views, Serializers)
│   └── config/      (Settings, URLs)
└── README.md
```

---

## 🔑 Admin Access

- **URL:** http://localhost:8000/admin/
- **Username:** admin
- **Password:** admin123

---

## 📝 Next Steps

1. Connect Angular `CalorieService` to Django API endpoints
2. Implement JWT token storage and HTTP interceptor in Angular
3. Create login/register pages
4. Complete history page with backend data
5. Add more features (meal suggestions, dietary preferences, etc.)



