
export interface DailyEntry {
    id?: number;
    date: string;
    foods: string[];
    pill_taken: boolean;
    symptom_severity: number;
    finalScore?: number;
    user_id?: string;
}

export interface FoodItem {
    id?: number;
    name: string;
    user_id?: string;
}

export interface FoodScore {
    food: string;
    totalScore: number;
    count: number;
    averageScore: number;
}