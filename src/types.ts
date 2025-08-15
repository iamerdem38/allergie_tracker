export interface FoodScore {
    food: string;
    totalScore: number;
    count: number;
    averageScore: number;
}

export type Database = {
  public: {
    Tables: {
      daily_entries: {
        Row: {
          id: number;
          date: string;
          foods: string[];
          pill_taken: boolean;
          symptom_severity: number;
          user_id: string;
        };
        Insert: {
          date: string;
          foods: string[];
          pill_taken: boolean;
          symptom_severity: number;
          user_id: string;
        };
        Update: {
          date?: string;
          foods?: string[];
          pill_taken?: boolean;
          symptom_severity?: number;
        };
        Relationships: [];
      };
      food_items: {
        Row: {
          id: number;
          name: string;
          user_id: string;
        };
        Insert: {
          name: string;
          user_id: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type DailyEntry = Database['public']['Tables']['daily_entries']['Row'] & {
    finalScore?: number;
};

export type FoodItem = Database['public']['Tables']['food_items']['Row'];