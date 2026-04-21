from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from .models import Profile, DailyGoal, Product, MealEntry
from .utils import calculate_daily_goals


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=4)
    age = serializers.IntegerField(min_value=10)
    height = serializers.IntegerField(min_value=100)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2)
    gender = serializers.ChoiceField(choices=['male', 'female'], required=False)
    sex = serializers.ChoiceField(choices=['male', 'female'], required=False, write_only=True)

    def validate(self, attrs):
        if 'gender' not in attrs:
            legacy_gender = attrs.get('sex')
            if legacy_gender:
                attrs['gender'] = legacy_gender
            else:
                raise serializers.ValidationError({'gender': 'This field is required.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        age = validated_data.pop('age')
        height = validated_data.pop('height')
        weight = validated_data.pop('weight')
        gender = validated_data.pop('gender')
        validated_data.pop('sex', None)

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )

        profile = user.profile
        profile.age = age
        profile.height = height
        profile.weight = weight
        profile.sex = gender
        profile.save()

        goals = calculate_daily_goals(age=age, height=height, weight=float(weight), gender=gender)
        daily_goal = user.daily_goal
        daily_goal.calorie_goal = goals['calorie_goal']
        daily_goal.protein_goal = goals['protein_goal']
        daily_goal.fat_goal = goals['fat_goal']
        daily_goal.carbs_goal = goals['carbs_goal']
        daily_goal.save()

        return user


class DailySummarySerializer(serializers.Serializer):
    date = serializers.DateField()
    total_calories = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_protein = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_fat = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_carbs = serializers.DecimalField(max_digits=10, decimal_places=2)


class ProfileSerializer(serializers.ModelSerializer):
    gender = serializers.ChoiceField(choices=Profile.SEX_CHOICES, source='sex')

    class Meta:
        model = Profile
        fields = ['age', 'height', 'weight', 'gender', 'role']
        read_only_fields = ['role']


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
    product_name = serializers.SerializerMethodField()
    calories = serializers.SerializerMethodField()
    protein = serializers.SerializerMethodField()
    fat = serializers.SerializerMethodField()
    carbs = serializers.SerializerMethodField()
    save_product = serializers.BooleanField(write_only=True, required=False, default=False)
    entry_name = serializers.CharField(required=False, allow_blank=True)
    calories_per_100g = serializers.DecimalField(max_digits=7, decimal_places=2, required=False)
    protein_per_100g = serializers.DecimalField(max_digits=7, decimal_places=2, required=False, default=0)
    fat_per_100g = serializers.DecimalField(max_digits=7, decimal_places=2, required=False, default=0)
    carbs_per_100g = serializers.DecimalField(max_digits=7, decimal_places=2, required=False, default=0)

    class Meta:
        model = MealEntry
        fields = [
            'id',
            'product',
            'product_name',
            'entry_name',
            'calories_per_100g',
            'protein_per_100g',
            'fat_per_100g',
            'carbs_per_100g',
            'grams',
            'meal_type',
            'date',
            'created_at',
            'calories',
            'protein',
            'fat',
            'carbs',
            'save_product',
        ]
        read_only_fields = ['id', 'created_at', 'product_name', 'calories', 'protein', 'fat', 'carbs']
        extra_kwargs = {
            'product': {'required': False, 'allow_null': True},
            'entry_name': {'required': False, 'allow_blank': True},
            'calories_per_100g': {'required': False},
            'protein_per_100g': {'required': False},
            'fat_per_100g': {'required': False},
            'carbs_per_100g': {'required': False},
        }

    def get_product_name(self, obj):
        return obj.entry_name

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
        if value and value.user != request.user:
            raise serializers.ValidationError('You can use only your own products.')
        return value

    def validate(self, attrs):
        product = attrs.get('product')
        entry_name = attrs.get('entry_name')
        calories_per_100g = attrs.get('calories_per_100g')
        save_product = attrs.get('save_product', False)

        if product is None and not entry_name:
            raise serializers.ValidationError({'entry_name': 'entry_name is required when product is not provided.'})

        if product is None and calories_per_100g is None:
            raise serializers.ValidationError({'calories_per_100g': 'calories_per_100g is required for manual entries.'})

        if product is not None and any(field in attrs for field in ['entry_name', 'calories_per_100g', 'protein_per_100g', 'fat_per_100g', 'carbs_per_100g']) and not save_product:
            pass

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        validated_data.pop('user', None)
        save_product = validated_data.pop('save_product', False)
        product = validated_data.pop('product', None)

        if product is not None:
            entry_name = product.name
            calories_per_100g = product.calories_per_100g
            protein_per_100g = product.protein_per_100g
            fat_per_100g = product.fat_per_100g
            carbs_per_100g = product.carbs_per_100g
        else:
            entry_name = validated_data.pop('entry_name')
            calories_per_100g = validated_data.pop('calories_per_100g')
            protein_per_100g = validated_data.pop('protein_per_100g', 0)
            fat_per_100g = validated_data.pop('fat_per_100g', 0)
            carbs_per_100g = validated_data.pop('carbs_per_100g', 0)

            if save_product:
                product = Product.objects.create(
                    user=request.user,
                    name=entry_name,
                    calories_per_100g=calories_per_100g,
                    protein_per_100g=protein_per_100g,
                    fat_per_100g=fat_per_100g,
                    carbs_per_100g=carbs_per_100g,
                )

        entry = MealEntry.objects.create(
            user=request.user,
            product=product,
            entry_name=entry_name,
            calories_per_100g=calories_per_100g,
            protein_per_100g=protein_per_100g,
            fat_per_100g=fat_per_100g,
            carbs_per_100g=carbs_per_100g,
            **validated_data,
        )
        return entry
