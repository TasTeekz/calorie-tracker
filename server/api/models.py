from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.PositiveIntegerField(default=18)
    height = models.PositiveIntegerField(default=170)  # cm
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=70.00)  # kg

    def __str__(self):
        return f"Profile of {self.user.username}"


class DailyGoal(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='daily_goal')
    calorie_goal = models.PositiveIntegerField(default=2000)
    protein_goal = models.DecimalField(max_digits=6, decimal_places=2, default=120.00)
    fat_goal = models.DecimalField(max_digits=6, decimal_places=2, default=70.00)
    carbs_goal = models.DecimalField(max_digits=6, decimal_places=2, default=200.00)

    def __str__(self):
        return f"Goals of {self.user.username}"


class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    calories_per_100g = models.DecimalField(max_digits=7, decimal_places=2)
    protein_per_100g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    fat_per_100g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    carbs_per_100g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class MealEntry(models.Model):
    MEAL_TYPES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_entries')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='meal_entries')
    grams = models.DecimalField(max_digits=7, decimal_places=2)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES, default='breakfast')
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def calculated_calories(self):
        return round((self.product.calories_per_100g * self.grams) / 100, 2)

    def calculated_protein(self):
        return round((self.product.protein_per_100g * self.grams) / 100, 2)

    def calculated_fat(self):
        return round((self.product.fat_per_100g * self.grams) / 100, 2)

    def calculated_carbs(self):
        return round((self.product.carbs_per_100g * self.grams) / 100, 2)

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.grams}g)"
