import { DailyEntry, FoodScore } from '../types';

export const isNextDay = (d1Str: string, d2Str: string): boolean => {
    const date1 = new Date(d1Str);
    date1.setUTCDate(date1.getUTCDate() + 1);
    return date1.toISOString().slice(0, 10) === new Date(d2Str).toISOString().slice(0, 10);
};

export const calculateDailyScore = (
    current: { symptom_severity: number; pill_taken: boolean },
    prev: { pill_taken: boolean } | null,
    next: { symptom_severity: number } | null
) => {
    const currentSeverity = current.symptom_severity;
    const nextDaySeverity = next ? next.symptom_severity : 0;
    const totalSeverity = currentSeverity + nextDaySeverity;
    const itchScore = totalSeverity / 10;
    
    let pillMultiplier = 0.25;
    let pillReason = "Keine Tablette heute oder gestern.";
    if (current.pill_taken) {
        pillMultiplier = 1;
        pillReason = "Tablette heute genommen.";
    } else if (prev && prev.pill_taken) {
        pillMultiplier = 0.5;
        pillReason = "Tablette gestern genommen.";
    }

    const score = itchScore * pillMultiplier;
    
    return {
        score,
        calculation: {
            currentSeverity,
            nextDaySeverity,
            totalSeverity,
            itchScore,
            pillMultiplier,
            pillReason,
        }
    };
};

export const calculateAllFoodScores = (dailyEntries: DailyEntry[], foodItems: string[]): FoodScore[] => {
    const entries = [...dailyEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const foodScoresMap: { [key: string]: { totalScore: number; count: number } } = foodItems.reduce((acc, food) => ({ ...acc, [food]: { totalScore: 0, count: 0 } }), {});

    const entriesWithScores: DailyEntry[] = entries.map((current, i) => {
        const prev = (i > 0 && isNextDay(entries[i-1].date, current.date)) ? entries[i-1] : null;
        const next = (i < entries.length - 1 && isNextDay(current.date, entries[i+1].date)) ? entries[i+1] : null;
        const { score } = calculateDailyScore(current, prev, next);
        return { ...current, finalScore: score };
    });

    entriesWithScores.forEach(entry => {
        entry.foods.forEach(food => {
            if (foodScoresMap[food]) {
                if (entry.finalScore && entry.finalScore > 0) {
                    foodScoresMap[food].totalScore += entry.finalScore;
                }
                foodScoresMap[food].count++;
            }
        });
    });
    
    return foodItems.map(food => {
        const { totalScore, count } = foodScoresMap[food] || { totalScore: 0, count: 0 };
        return { food, totalScore, count, averageScore: count > 0 ? totalScore / count : 0 };
    });
};