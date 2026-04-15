# Backend Integration Guide for ChatGPT

_Используй этот файл чтобы понять структуру проекта при работе с ним._

---

## 📌 Состояние проекта

### Что готово ✅

- **Backend (Django):** ПОЛНОСТЬЮ готов, API запущен на `http://localhost:8000/api/`
- **Frontend (Angular):** UI готов, но НЕ подключен к API (использует localStorage)
- **База данных:** SQLite3, все таблицы созданы и работают
- **Аутентификация:** JWT готов, суперпользователь создан

### Что нужно сделать ⏳

1. Подключить Angular к Django API
2. Заменить localStorage на API вызовы
3. Добавить HTTP interceptor для JWT токенов
4. Создать login/register страницы
5. Доделать history компонент

---

## 🔗 API Быстро Доступно

**Базовый URL:** `http://localhost:8000/api/`

### Аутентификация

```bash
# Регистрация
POST /api/register/
Body: {"username": "testuser", "password": "1234"}

# Логин
POST /api/login/
Body: {"username": "testuser", "password": "1234"}
Response: {"access": "token...", "refresh": "token..."}

# Обновить токен
POST /api/token/refresh/
Body: {"refresh": "token..."}

# Логаут
POST /api/logout/
Body: {"refresh": "token..."}
```

### Основная логика

```bash
# Получить продукты пользователя
GET /api/products/
Header: Authorization: Bearer <ACCESS_TOKEN>

# Создать рецепт (продукт)
POST /api/products/
Header: Authorization: Bearer <ACCESS_TOKEN>
Body: {
  "name": "Куриное филе",
  "calories_per_100g": 165,
  "protein_per_100g": 31,
  "fat_per_100g": 3.6,
  "carbs_per_100g": 0
}

# Добавить запись о еде
POST /api/entries/
Header: Authorization: Bearer <ACCESS_TOKEN>
Body: {
  "product": 1,
  "grams": 150,
  "meal_type": "lunch",
  "date": "2026-04-15"
}

# Получить записи за день
GET /api/entries/?date=2026-04-15
Header: Authorization: Bearer <ACCESS_TOKEN>

# Получить дневную сумму КБЖУ
GET /api/summary/?date=2026-04-15
Header: Authorization: Bearer <ACCESS_TOKEN>
Response: {
  "date": "2026-04-15",
  "total_calories": 2150.75,
  "total_protein": 95.50,
  "total_fat": 68.25,
  "total_carbs": 245.00
}
```

---

## 📂 Структура Backend Новые Файлы

```
server/api/
├── models.py               # 4 модели БД
│   ├── Profile            (OneToOne → User)
│   ├── DailyGoal          (OneToOne → User)
│   ├── Product            (ForeignKey → User)
│   └── MealEntry          (ForeignKey → User, Product)
│
├── views.py               # API Controllers
│   ├── register_view()    (FBV)
│   ├── logout_view()      (FBV)
│   ├── ProfileGoalAPIView (CBV: GET, PUT)
│   ├── ProductListCreateAPIView (GET, POST)
│   ├── ProductDetailAPIView (GET, PUT, DELETE)
│   ├── MealEntryListCreateAPIView (GET, POST)
│   ├── MealEntryDetailAPIView (DELETE)
│   └── DailySummaryAPIView (GET)
│
├── serializers.py         # Data Validation
│   ├── RegisterSerializer
│   ├── DailySummarySerializer
│   ├── ProfileSerializer
│   ├── DailyGoalSerializer
│   ├── ProductSerializer
│   └── MealEntrySerializer
│
├── urls.py                # Route Mapping
├── signals.py             # Auto-create profile
├── admin.py               # Django Admin
├── apps.py                # App Config
├── migrations/            # DB Migrations
│   └── 0001_initial.py
└── __init__.py
```

---

## 🔧 Конфигурация

### settings.py (обновлен)

```python
INSTALLED_APPS = [
    ...
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← Добавлен первым!
    ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'BLACKLIST_AFTER_ROTATION': True,
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',  # Angular frontend
]
```

### urls.py (обновлен)

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

---

## 👤 Администратор

**Логин:** `admin`  
**Пароль:** `admin123`  
**URL:** `http://localhost:8000/admin/`

Здесь можно смотреть и редактировать:

- Users
- Profiles
- DailyGoals
- Products
- MealEntries

---

## 📊 Примеры Ответов API

### POST /api/register/ → 201

```json
{
  "message": "User registered successfully",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/login/ → 200

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/products/ → 200

```json
[
  {
    "id": 1,
    "name": "Куриное филе",
    "calories_per_100g": "165.00",
    "protein_per_100g": "31.00",
    "fat_per_100g": "3.60",
    "carbs_per_100g": "0.00",
    "created_at": "2026-04-15T11:30:00Z"
  }
]
```

### GET /api/entries/?date=2026-04-15 → 200

```json
[
  {
    "id": 1,
    "product": 1,
    "product_name": "Куриное филе",
    "grams": "150.00",
    "meal_type": "lunch",
    "date": "2026-04-15",
    "created_at": "2026-04-15T11:35:00Z",
    "calories": 247.5,
    "protein": 46.5,
    "fat": 5.4,
    "carbs": 0.0
  }
]
```

### GET /api/summary/?date=2026-04-15 → 200

```json
{
  "date": "2026-04-15",
  "total_calories": "2150.75",
  "total_protein": "95.50",
  "total_fat": "68.25",
  "total_carbs": "245.00"
}
```

---

## 🚀 Следующие Шаги для Frontend

### 1. Обновить CalorieService

```typescript
// Вместо localStorage, использовать HTTP:
addFood(item: FoodItem) {
  return this.http.post('/api/entries/', item, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`
    })
  });
}
```

### 2. Создать HTTP Interceptor

```typescript
export class JwtInterceptor implements HttpInterceptor {
  intercept(req, next) {
    const token = localStorage.getItem("access_token");
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(req);
  }
}
```

### 3. Добавить Login Flow

- Создать LoginComponent
- POST на `/api/register/` для нового пользователя
- POST на `/api/login/` для существующих
- Сохранить tokens в localStorage
- Перенаправить на TrackerComponent

### 4. Обновить TrackerComponent

```typescript
this.http.get("/api/products/").subscribe((products) => {
  this.products = products; // ← вместо PRODUCT_DATABASE
});

this.http.post("/api/entries/", formData).subscribe((response) => {
  // Успех - обновить список
});

this.http.get(`/api/summary/?date=${selectedDate}`).subscribe((summary) => {
  this.displaySummary(summary);
});
```

---

## ⚠️ Важные Моменты

### Привязка к пользователю

- Все Product и MealEntry **автоматически** связаны с `request.user`
- API фильтрует данные так что юзер видит только свои данные
- Нельзя использовать чужие products для meal_entries (валидация в сериализаторе)

### Сигналы Django

- При создании User → автоматически создается Profile + DailyGoal
- Профиль имеет дефолтные значения:
  - age: 18
  - height: 170cm
  - weight: 70kg
  - calorie_goal: 2000
  - protein_goal: 120g

### Логаут

- Refresh token добавляется в черный список (token_blacklist таблица)
- Access token можно использовать до истечения (60 минут)
- При логауте нужно послать refresh токен

---

## 🔒 Безопасность

- Токены JWT с гарантией подписи
- Пароли хешируются Django hashers
- CORS ограничен на `http://localhost:4200`
- DEBUG=True только в development (менять в production)
- SECRET_KEY должен быть в .env файле (не в git)

---

## 📝 Для Создания Тестовых Данных

### Через curl (Linux/Mac/Git Bash)

```bash
# 1. Зарегистрировать пользователя
TOKEN=$(curl -s -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' | jq -r '.access')

# 2. Создать продукт
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Apple","calories_per_100g":52,"protein_per_100g":0.3}'

# 3. Добавить запись
curl -X POST http://localhost:8000/api/entries/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product":1,"grams":100,"meal_type":"breakfast","date":"2026-04-15"}'

# 4. Получить статистику
curl http://localhost:8000/api/summary/?date=2026-04-15 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Common Errors & Fixes

| Error            | Причина                             | Решение                                    |
| ---------------- | ----------------------------------- | ------------------------------------------ |
| CORS error       | Frontend на другом порту            | Проверь CORS_ALLOWED_ORIGINS в settings.py |
| Token invalid    | Токен истек или неправильный        | Используй /api/token/refresh/              |
| 401 Unauthorized | Заголовок Authorization отсутствует | Добавь Bearer token в headers              |
| 404 Not Found    | Неправильный endpoint               | Проверь URL в api/urls.py                  |
| 400 Bad Request  | Неправильные данные                 | Проверь serializers.py для валидации       |

---

## 📞 Quick Commands

```bash
# Запустить сервер
cd server && . venv/Scripts/activate && python manage.py runserver

# Создать миграции
python manage.py makemigrations

# Применить миграции
python manage.py migrate

# Django shell (интерпретатор)
python manage.py shell

# Проверить синтаксис
python manage.py check

# Создать суперпользователя
python manage.py createsuperuser

# Очистить БД (WARNING: удаляет все данные!)
rm db.sqlite3 && python manage.py migrate
```

---

**В целом:** Backend полностью готов! Осталось интегрировать с Angular frontend.
