from decimal import Decimal


def calculate_daily_goals(age: int, height: float, weight: float, gender: str):
    if gender == 'female':
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5

    calories = round(bmr * 1.2)
    protein = round(weight * 1.6, 1)
    fat = round(weight * 0.8, 1)

    protein_kcal = protein * 4
    fat_kcal = fat * 9
    carbs = round(max(0, (calories - protein_kcal - fat_kcal) / 4), 1)

    return {
        'calorie_goal': calories,
        'protein_goal': Decimal(str(protein)),
        'fat_goal': Decimal(str(fat)),
        'carbs_goal': Decimal(str(carbs)),
    }
