from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    SEX_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.PositiveIntegerField(default=18)
    height = models.PositiveIntegerField(default=170)  # cm
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=70.00)  # kg
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, default='male')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='USER')

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
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='meal_entries')
    entry_name = models.CharField(max_length=255, default='')
    calories_per_100g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    protein_per_100g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    fat_per_100g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    carbs_per_100g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    grams = models.DecimalField(max_digits=7, decimal_places=2)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES, default='breakfast')
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def calculated_calories(self):
        return round((self._calories_per_100g() * self.grams) / 100, 2)

    def calculated_protein(self):
        return round((self._protein_per_100g() * self.grams) / 100, 2)

    def calculated_fat(self):
        return round((self._fat_per_100g() * self.grams) / 100, 2)

    def calculated_carbs(self):
        return round((self._carbs_per_100g() * self.grams) / 100, 2)

    def _calories_per_100g(self):
        if self.calories_per_100g:
            return self.calories_per_100g
        if self.product:
            return self.product.calories_per_100g
        return 0

    def _protein_per_100g(self):
        if self.protein_per_100g:
            return self.protein_per_100g
        if self.product:
            return self.product.protein_per_100g
        return 0

    def _fat_per_100g(self):
        if self.fat_per_100g:
            return self.fat_per_100g
        if self.product:
            return self.product.fat_per_100g
        return 0

    def _carbs_per_100g(self):
        if self.carbs_per_100g:
            return self.carbs_per_100g
        if self.product:
            return self.product.carbs_per_100g
        return 0

    def __str__(self):
        return f"{self.user.username} - {self.entry_name} ({self.grams}g)"
