from decimal import Decimal
import logging

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, DailyGoal, Product, MealEntry
from .serializers import (
    RegisterSerializer,
    DailySummarySerializer,
    ProfileSerializer,
    DailyGoalSerializer,
    ProductSerializer,
    MealEntrySerializer,
)
from .utils import calculate_daily_goals


logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        logger.debug('Register user_id=%s username=%s', user.id, user.username)
        return Response({
            'message': 'User registered successfully',
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileGoalAPIView(APIView):
    def get(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={'sex': 'male', 'role': 'USER', 'is_profile_completed': False},
        )
        goal, _ = DailyGoal.objects.get_or_create(user=request.user)

        logger.debug(
            'Profile GET user_id=%s profile_id=%s completed=%s',
            request.user.id,
            profile.id,
            profile.is_profile_completed,
        )

        return Response({
            'profile': ProfileSerializer(profile).data,
            'daily_goal': DailyGoalSerializer(goal).data,
        })

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={'sex': 'male', 'role': 'USER', 'is_profile_completed': False},
        )
        goal, _ = DailyGoal.objects.get_or_create(user=request.user)
        profile_data = request.data.get('profile', {})
        goal_data = request.data.get('daily_goal', {})
        profile_fields = {'age', 'height', 'weight', 'gender'}

        profile_serializer = ProfileSerializer(profile, data=profile_data, partial=True)
        goal_serializer = DailyGoalSerializer(goal, data=goal_data, partial=True)

        if profile_serializer.is_valid() and goal_serializer.is_valid():
            updated_profile = profile_serializer.save()

            if any(field in profile_data for field in profile_fields):
                goals = calculate_daily_goals(
                    age=updated_profile.age,
                    height=updated_profile.height,
                    weight=float(updated_profile.weight),
                    gender=updated_profile.sex,
                )
                goal.calorie_goal = goals['calorie_goal']
                goal.protein_goal = goals['protein_goal']
                goal.fat_goal = goals['fat_goal']
                goal.carbs_goal = goals['carbs_goal']

                if all(field in profile_data for field in profile_fields):
                    updated_profile.is_profile_completed = True
                    updated_profile.save(update_fields=['is_profile_completed'])

                logger.debug(
                    'Profile PUT user_id=%s profile_id=%s completed=%s profile_data=%s',
                    request.user.id,
                    updated_profile.id,
                    updated_profile.is_profile_completed,
                    profile_data,
                )

            goal_serializer.save()

            return Response({
                'profile': ProfileSerializer(updated_profile).data,
                'daily_goal': DailyGoalSerializer(goal).data,
            })

        return Response({
            'profile_errors': profile_serializer.errors,
            'goal_errors': goal_serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class ProductListCreateAPIView(APIView):
    def get(self, request):
        products = Product.objects.filter(user=request.user).order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailAPIView(APIView):
    def get_object(self, request, pk):
        try:
            return Product.objects.get(pk=pk, user=request.user)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self.get_object(request, pk)
        if not product:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product)
        return Response(serializer.data)

    def put(self, request, pk):
        product = self.get_object(request, pk)
        if not product:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(request, pk)
        if not product:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        product.delete()
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class MealEntryListCreateAPIView(APIView):
    def get(self, request):
        date = request.query_params.get('date')
        entries = MealEntry.objects.filter(user=request.user)

        if date:
            entries = entries.filter(date=date)

        entries = entries.order_by('-created_at')
        serializer = MealEntrySerializer(entries, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MealEntrySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MealEntryDetailAPIView(APIView):
    def get_object(self, request, pk):
        try:
            return MealEntry.objects.get(pk=pk, user=request.user)
        except MealEntry.DoesNotExist:
            return None

    def delete(self, request, pk):
        entry = self.get_object(request, pk)
        if not entry:
            return Response({'error': 'Entry not found'}, status=status.HTTP_404_NOT_FOUND)

        entry.delete()
        return Response({'message': 'Entry deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class DailySummaryAPIView(APIView):
    def get(self, request):
        date = request.query_params.get('date')
        if not date:
            return Response({'error': 'date query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        entries = MealEntry.objects.filter(user=request.user, date=date)

        total_calories = Decimal('0.00')
        total_protein = Decimal('0.00')
        total_fat = Decimal('0.00')
        total_carbs = Decimal('0.00')

        for entry in entries:
            total_calories += Decimal(str(entry.calculated_calories()))
            total_protein += Decimal(str(entry.calculated_protein()))
            total_fat += Decimal(str(entry.calculated_fat()))
            total_carbs += Decimal(str(entry.calculated_carbs()))

        serializer = DailySummarySerializer({
            'date': date,
            'total_calories': total_calories,
            'total_protein': total_protein,
            'total_fat': total_fat,
            'total_carbs': total_carbs,
        })
        return Response(serializer.data)
