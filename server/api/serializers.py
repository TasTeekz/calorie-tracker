from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Profile, DailyGoal, Product, MealEntry


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=4)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class DailySummarySerializer(serializers.Serializer):
    date = serializers.DateField()
    total_calories = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_protein = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_fat = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_carbs = serializers.DecimalField(max_digits=10, decimal_places=2)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['age', 'height', 'weight']


class DailyGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyGoal
        fields = ['calorie_goal', 'protein_goal', 'fat_goal', 'carbs_goal']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'calories_per_100g',
            'protein_per_100g',
            'fat_per_100g',
            'carbs_per_100g',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class MealEntrySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    calories = serializers.SerializerMethodField()
    protein = serializers.SerializerMethodField()
    fat = serializers.SerializerMethodField()
    carbs = serializers.SerializerMethodField()

    class Meta:
        model = MealEntry
        fields = [
            'id',
            'product',
            'product_name',
            'grams',
            'meal_type',
            'date',
            'created_at',
            'calories',
            'protein',
            'fat',
            'carbs',
        ]
        read_only_fields = ['id', 'created_at', 'product_name', 'calories', 'protein', 'fat', 'carbs']

    def get_calories(self, obj):
        return obj.calculated_calories()

    def get_protein(self, obj):
        return obj.calculated_protein()

    def get_fat(self, obj):
        return obj.calculated_fat()

    def get_carbs(self, obj):
        return obj.calculated_carbs()

    def validate_product(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError('You can use only your own products.')
        return value
