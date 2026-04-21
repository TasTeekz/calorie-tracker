export interface Profile {
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  is_profile_completed: boolean;
  role: 'USER' | 'ADMIN';
}

export interface DailyGoal {
  calorie_goal: number;
  protein_goal: number;
  fat_goal: number;
  carbs_goal: number;
}

export interface ProfileGoalResponse {
  profile: Profile;
  daily_goal: DailyGoal;
}

export interface ProfileGoalUpdateRequest {
  profile?: Partial<Profile>;
  daily_goal?: Partial<DailyGoal>;
}
