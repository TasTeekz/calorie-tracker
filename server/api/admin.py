from django.contrib import admin
from .models import Profile, DailyGoal, Product, MealEntry

admin.site.register(Profile)
admin.site.register(DailyGoal)
admin.site.register(Product)
admin.site.register(MealEntry)
