# Backend Setup - Calorie Tracker

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Активируй виртуальное окружение (если еще не активировано)
venv\Scripts\activate

# Установи зависимости
pip install -r requirements.txt
```

### 2. Создание и применение миграций

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Создание суперпользователя (админ)

```bash
python manage.py createsuperuser
# Введи username и пароль
```

### 4. Запуск сервера

```bash
python manage.py runserver
```

Сервер будет доступен на `http://localhost:8000`

---

## 📋 API Endpoints

### 🔐 Аутентификация

| Method | Endpoint              | Описание                          |
| ------ | --------------------- | --------------------------------- |
| POST   | `/api/register/`      | Регистрация нового пользователя   |
| POST   | `/api/login/`         | Логин (получить токены)           |
| POST   | `/api/token/refresh/` | Обновить access token             |
| POST   | `/api/logout/`        | Логаут (blacklist refresh токена) |

### 👤 Профиль

| Method | Endpoint        | Описание                |
| ------ | --------------- | ----------------------- |
| GET    | `/api/profile/` | Получить профиль и цели |
| PUT    | `/api/profile/` | Обновить профиль и цели |

### 🍽️ Продукты

| Method | Endpoint              | Описание                      |
| ------ | --------------------- | ----------------------------- |
| GET    | `/api/products/`      | Список продуктов пользователя |
| POST   | `/api/products/`      | Создать новый продукт         |
| GET    | `/api/products/<id>/` | Получить продукт              |
| PUT    | `/api/products/<id>/` | Обновить продукт              |
| DELETE | `/api/products/<id>/` | Удалить продукт               |

### 📝 Записи о еде

| Method | Endpoint             | Описание                                                    |
| ------ | -------------------- | ----------------------------------------------------------- |
| GET    | `/api/entries/`      | Список всех записей (можно фильтровать: `?date=2026-04-15`) |
| POST   | `/api/entries/`      | Добавить запись о еде                                       |
| DELETE | `/api/entries/<id>/` | Удалить запись                                              |

### 📊 Статистика

| Method | Endpoint                        | Описание                    |
| ------ | ------------------------------- | --------------------------- |
| GET    | `/api/summary/?date=2026-04-15` | Дневная сумма калорий и БЖУ |

---

## 💡 Примеры использования

### Регистрация

```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "1234"}'
```

**Ответ:**

```json
{
  "message": "User registered successfully",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Логин

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "1234"}'
```

**Ответ:**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Создать продукт

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Куриное филе",
    "calories_per_100g": 165,
    "protein_per_100g": 31,
    "fat_per_100g": 3.6,
    "carbs_per_100g": 0
  }'
```

### Создать запись о еде

```bash
curl -X POST http://localhost:8000/api/entries/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "product": 1,
    "grams": 150,
    "meal_type": "lunch",
    "date": "2026-04-15"
  }'
```

### Получить дневную сумму

```bash
curl -X GET "http://localhost:8000/api/summary/?date=2026-04-15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Ответ:**

```json
{
  "date": "2026-04-15",
  "total_calories": 2150.75,
  "total_protein": 95.5,
  "total_fat": 68.25,
  "total_carbs": 245.0
}
```

---

## 🔒 Аутентификация в запросах

Все защищенные endpoints требуют заголовок:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Пример для fetch в Angular:

```typescript
this.http.get("/api/profile/", {
  headers: new HttpHeaders({
    Authorization: `Bearer ${accessToken}`,
  }),
});
```

---

## 🛠️ Дополнительно

### Админ-панель

Откройся `http://localhost:8000/admin/` и логинься с суперпользователем.

### Смотреть БД

```bash
# Интерактивная оболочка Django
python manage.py shell

# Примеры:
>>> from api.models import Product, MealEntry
>>> Product.objects.all()
>>> MealEntry.objects.filter(date='2026-04-15')
```

---

## ⚠️ Часто встречаемые проблемы

### CORS ошибка при запросе с Frontend

Если видишь CORS ошибку, проверь что в `config/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',  # Убедись что здесь URL твоего Angular
]
```

### "Token is invalid or expired"

- Проверь что access token не истек (60 минут по умолчанию)
- Используй endpoint `/api/token/refresh/` с refresh токеном

### "Module not found" при запуске

```bash
# Убедись что все зависимости установлены
pip install -r requirements.txt
```

---

## 📚 Структура проекта

```
server/
├── config/          # Основная конфигурация Django
│   ├── settings.py  # Настройки проекта
│   ├── urls.py      # URL маршруты
│   ├── wsgi.py
│   └── asgi.py
├── api/             # Django приложение для API
│   ├── models.py    # 4 модели: Profile, DailyGoal, Product, MealEntry
│   ├── views.py     # API endpoints (2 FBV + несколько CBV)
│   ├── serializers.py # Сериализаторы
│   ├── urls.py      # URL маршруты для api/
│   ├── signals.py   # Сигналы для автосоздания профилей
│   ├── admin.py     # Админ-панель
│   └── apps.py      # Конфиг приложения
├── manage.py        # Django CLI
├── requirements.txt # Зависимости
└── db.sqlite3       # БД (создается после миграций)
```
