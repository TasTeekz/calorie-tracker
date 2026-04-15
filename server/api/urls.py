from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    register_view,
    logout_view,
    ProfileGoalAPIView,
    ProductListCreateAPIView,
    ProductDetailAPIView,
    MealEntryListCreateAPIView,
    MealEntryDetailAPIView,
    DailySummaryAPIView,
)

urlpatterns = [
    path('register/', register_view),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view),

    path('profile/', ProfileGoalAPIView.as_view()),

    path('products/', ProductListCreateAPIView.as_view()),
    path('products/<int:pk>/', ProductDetailAPIView.as_view()),

    path('entries/', MealEntryListCreateAPIView.as_view()),
    path('entries/<int:pk>/', MealEntryDetailAPIView.as_view()),

    path('summary/', DailySummaryAPIView.as_view()),
]
