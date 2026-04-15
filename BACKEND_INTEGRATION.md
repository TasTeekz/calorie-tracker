# ✅ Backend Integration Complete

## 📌 Summary

Полная рабочая версия Django + DRF + JWT backend была успешно интегрирована в проект **Calorie Tracker**.

---

## 🎯 Что было сделано

### ✓ Создана полная структура API приложения

- **models.py** — 4 модели: `Profile`, `DailyGoal`, `Product`, `MealEntry`
- **views.py** — 2 FBV + 5 CBV для всех операций
- **serializers.py** — 6 сериализаторов (обычные + ModelSerializer)
- **urls.py** — маршруты всех API endpoints
- **signals.py** — автосоздание профилей при регистрации
- **admin.py** — админ-панель для управления данными

### ✓ Конфигурация Django

- Добавлены все требуемые зависимости в `installed_apps`
- Настроена JWT аутентификация (djangorestframework-simplejwt)
- Включена CORS поддержка для Angular (localhost:4200)
- TimeZone установлен на 'Asia/Almaty'
- REST Framework настроен с JWT authentication по умолчанию

### ✓ База данных

- Созданы все миграции
- Применены миграции (27 шагов, включая token_blacklist)
- SQLite база полностью готова

### ✓ Администраторский доступ

- Создан суперпользователь
- **Логин:** admin / **Пароль:** admin123
- Админ-панель доступна на `http://localhost:8000/admin/`

### ✓ Сервер запущен

- Django dev сервер работает на `http://localhost:8000`
- API доступен на `http://localhost:8000/api/`

---

## 📚 Полный список API endpoints

### 🔐 Аутентификация

| Method | Endpoint              | Описание                                |
| ------ | --------------------- | --------------------------------------- |
| POST   | `/api/register/`      | Регистрация пользователя                |
| POST   | `/api/login/`         | Логин (получить токены)                 |
| POST   | `/api/token/refresh/` | Обновить access token                   |
| POST   | `/api/logout/`        | Логаут (добавить токен в черный список) |

### 👤 Профиль

| Method | Endpoint        |
| ------ | --------------- |
| GET    | `/api/profile/` |
| PUT    | `/api/profile/` |

### 🍽️ Продукты

| Method | Endpoint              |
| ------ | --------------------- |
| GET    | `/api/products/`      |
| POST   | `/api/products/`      |
| GET    | `/api/products/<id>/` |
| PUT    | `/api/products/<id>/` |
| DELETE | `/api/products/<id>/` |

### 📝 Записи о еде

| Method | Endpoint                               |
| ------ | -------------------------------------- |
| GET    | `/api/entries/` или `?date=YYYY-MM-DD` |
| POST   | `/api/entries/`                        |
| DELETE | `/api/entries/<id>/`                   |

### 📊 Статистика

| Method | Endpoint                        |
| ------ | ------------------------------- |
| GET    | `/api/summary/?date=YYYY-MM-DD` |

---

## 🧪 Тестирование API

### 1️⃣ Регистрация

```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "1234"}'
```

**Ответ:**

```json
{
  "message": "User registered successfully",
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2️⃣ Создать продукт

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

### 3️⃣ Добавить запись о еде

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

### 4️⃣ Получить дневную статистику

```bash
curl -X GET "http://localhost:8000/api/summary/?date=2026-04-15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📂 Созданные файлы

```
server/
├── api/                          # Новое приложение
│   ├── __init__.py
│   ├── models.py                 # 4 модели
│   ├── views.py                  # 7 API views
│   ├── serializers.py            # 6 сериализаторов
│   ├── urls.py                   # API маршруты
│   ├── signals.py                # Сигналы Django
│   ├── admin.py                  # Админ-панель
│   ├── apps.py                   # Конфигурация
│   ├── migrations/               # Миграции БД
│   │   └── 0001_initial.py
│   └── tests.py
├── config/
│   ├── settings.py               # ✏️ ОБНОВЛЕН
│   └── urls.py                   # ✏️ ОБНОВЛЕН
├── requirements.txt              # ✏️ ДОБАВЛЕН
├── SETUP.md                      # ✏️ ДОБАВЛЕН
└── set_admin_password.py         # Вспомогательный скрипт
```

---

## 🔄 Архитектура

```
┌─────────────────────────────────────────────────────┐
│  Angular Frontend (localhost:4200)                  │
│  ├── Components: Tracker, History                   │
│  ├── Service: CalorieService                        │
│  └── Models: FoodItem, etc.                         │
└────────────────────┬────────────────────────────────┘
                     │ API Calls (HTTP + JWT)
                     ↓
┌─────────────────────────────────────────────────────┐
│  Django Backend (localhost:8000)                    │
│  ├── REST API: /api/*                               │
│  ├── JWT Auth: SimplJWT                             │
│  ├── Models:                                        │
│  │   ├── User (Django)                              │
│  │   ├── Profile (OneToOne)                         │
│  │   ├── DailyGoal (OneToOne)                       │
│  │   ├── Product (ForeignKey User)                  │
│  │   └── MealEntry (ForeignKey User+Product)        │
│  └── Database: SQLite3                              │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Требования

Установлены все зависимости (в `server/requirements.txt`):

- Django==6.0.4
- djangorestframework==3.17.1
- django-cors-headers==4.0.0
- djangorestframework-simplejwt==5.5.1
- setuptools (для pkg_resources)

---

## 🚀 Следующие шаги

### Frontend интеграция

1. **Обновить CalorieService** — переключиться с localStorage на API
2. **Создать HTTP Interceptor** — добавлять JWT token в заголовки
3. **Создать LoginComponent** — форма регистрации/входа
4. **Обновить TrackerComponent** — использовать `/api/entries/` и `/api/products/`
5. **Доделать HistoryComponent** — загружать данные с `/api/summary/`
6. **Хранение токенов** — сохранять в sessionStorage или localStorage

### Backend улучшения

1. Добавить пагинацию для больших списков
2. Фильтры и поиск продуктов
3. Рекомендации по калорийности
4. Уведомления при превышении лимитов
5. Production готовность (gunicorn, nginx)

---

## 💡 Важные детали

### Сигналы Django

При создании нового пользователя автоматически создаются:

- `Profile` с дефолтными значениями (age=18, height=170cm, weight=70kg)
- `DailyGoal` с дефолтными целями (2000 cal, 120g protein, etc.)

### Привязка данных к пользователю

Все `Product` и `MealEntry` связаны через `ForeignKey(User)`, поэтому:

- Каждый пользователь видит только свои продукты и записи
- API автоматически фильтрует данные через `request.user`

### JWT Tokens

- **Access token:** действует 60 минут
- **Refresh token:** действует 1 сутки
- **Logout:** добавляет refresh token в черный список (token_blacklist)

---

## 🐛 Troubleshooting

**CORS ошибка?**

- Проверьте что Angular работает на `http://localhost:4200`
- В settings.py должен быть `CORS_ALLOWED_ORIGINS = ['http://localhost:4200']`

**Token is invalid?**

- Access token может истечь (60 минут)
- Используйте `/api/token/refresh/` с refresh токеном

**ModuleNotFoundError?**

```bash
pip install --force-reinstall djangorestframework-simplejwt
```

---

## 📌 Статус проекта

| Компонент                    | Статус | Процент  |
| ---------------------------- | ------ | -------- |
| Backend Models               | ✅     | 100%     |
| Backend API                  | ✅     | 100%     |
| Backend Auth                 | ✅     | 100%     |
| Frontend UI                  | ✅     | 80%      |
| Frontend-Backend Integration | ⏳     | 0%       |
| Database                     | ✅     | 100%     |
| Admin Panel                  | ✅     | 100%     |
| **Итого**                    | **⏳** | **~65%** |

---

## 📖 Документация

- **API Docs:** [server/SETUP.md](../server/SETUP.md)
- **Models:** [server/api/models.py](../server/api/models.py)
- **Views:** [server/api/views.py](../server/api/views.py)
- **Frontend:** [client/README.md](../client/)

---

**Проект готов к интеграции Frontend с Backend! 🎉**
