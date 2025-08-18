import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DailyEntry, FoodItem, FoodScore } from '../types';
import { supabase } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { calculateAllFoodScores, calculateDailyScore, isNextDay } from '../services/calculationService';

import DailyEntryForm from './DailyEntryForm';
import FoodManagement from './FoodManagement';
import FoodRankingTable from './FoodRankingTable';
import Charts from './Charts';
import Calendar from './Calendar';
import EntriesTable from './EntriesTable';
import DataManagement from './DataManagement';
import DaysSinceLastEatenChart from './DaysSinceLastEatenChart';

const AllergyTracker: React.FC = () => {
    const { user, signOut } = useAuth();
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [entryToEdit, setEntryToEdit] = useState<DailyEntry | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const [foodResponse, entriesResponse] = await Promise.all([
                supabase.from('food_items').select('*').eq('user_id', user.id),
                supabase.from('daily_entries').select('*').eq('user_id', user.id)
            ]);

            if (foodResponse.error) throw foodResponse.error;
            if (entriesResponse.error) throw entriesResponse.error;

            setFoodItems(foodResponse.data || []);
            setDailyEntries(entriesResponse.data || []);
        } catch (err: any) {
            setError(err.message);
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const foodScores = useMemo(() => {
        if (!dailyEntries.length || !foodItems.length) return [];
        return calculateAllFoodScores(dailyEntries, foodItems.map(f => f.name));
    }, [dailyEntries, foodItems]);
    
    const entriesWithScores = useMemo(() => {
        const sortedForCalc = [...dailyEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const calculatedEntries = sortedForCalc.map((current, i) => {
            const prev = (i > 0 && isNextDay(sortedForCalc[i-1].date, current.date)) ? sortedForCalc[i-1] : null;
            const next = (i < sortedForCalc.length - 1 && isNextDay(current.date, sortedForCalc[i+1].date)) ? sortedForCalc[i+1] : null;
            const { score } = calculateDailyScore(current, prev, next);
            return { ...current, finalScore: score };
        });

        // sort back to descending for display
        return calculatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [dailyEntries]);

    const addFoodItem = async (name: string) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('food_items')
            .insert([{ name, user_id: user.id }])
            .select();
        
        if (error) {
            setError(error.message);
        } else if (data) {
            setFoodItems(prev => [...prev, data[0]]);
        }
    };

    const addOrUpdateDailyEntry = async (entry: Omit<DailyEntry, 'id' | 'user_id' | 'finalScore'>) => {
        if (!user) return;
        
        const existingEntry = dailyEntries.find(e => e.date === entry.date);

        const entryPayload = { ...entry, user_id: user.id };

        if (existingEntry && existingEntry.id) {
            // Update
            const { error } = await supabase
                .from('daily_entries')
                .update(entryPayload)
                .eq('id', existingEntry.id);
            if (error) setError(error.message);
            else await fetchData();
        } else {
            // Insert
            const { error } = await supabase
                .from('daily_entries')
                .insert([entryPayload]);
            if (error) setError(error.message);
            else await fetchData();
        }
        setEntryToEdit(null); // Clear edit state
    };

    const deleteDailyEntry = async (id: number) => {
        const { error } = await supabase.from('daily_entries').delete().eq('id', id);
        if(error) setError(error.message);
        else setDailyEntries(prev => prev.filter(e => e.id !== id));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl font-semibold">Lade Daten...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-600 bg-red-100 rounded-md m-8">Fehler: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 my-8">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Allergie-Tracker</h1>
                <button
                    onClick={signOut}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Abmelden
                </button>
            </header>
            
            <main className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                         <DailyEntryForm
                            foodItems={foodItems.map(f => f.name)}
                            onSubmit={addOrUpdateDailyEntry}
                            dailyEntries={dailyEntries}
                            entryToEdit={entryToEdit}
                            key={entryToEdit ? entryToEdit.date : 'new'}
                        />
                        <FoodManagement
                            foodItems={foodItems.map(f => f.name)}
                            onAddFood={addFoodItem}
                        />
                    </div>
                    <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-lg">
                         <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ergebnisse & Daten</h2>
                         <div className="space-y-8">
                            <FoodRankingTable scores={foodScores} />
                            <Charts 
                                scores={foodScores} 
                                dailyEntries={dailyEntries} 
                                foodItems={foodItems.map(f => f.name)} 
                            />
                            <Calendar dailyEntries={dailyEntries} />
                         </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-lg">
                    <DaysSinceLastEatenChart 
                        dailyEntries={dailyEntries} 
                        foodItems={foodItems.map(f => f.name)}
                    />
                </div>

                <div className="p-6 bg-white rounded-xl shadow-lg">
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Zeitverlauf der Allergiebeschwerden</h3>
                    <EntriesTable 
                        entries={entriesWithScores}
                        onDelete={deleteDailyEntry} 
                        onEdit={(entry) => {
                            setEntryToEdit(entry);
                            window.scrollTo(0, 0);
                        }} 
                    />
                </div>
                
                <div className="p-6 bg-white rounded-xl shadow-lg">
                    <DataManagement foodItems={foodItems} dailyEntries={dailyEntries} onImport={fetchData}/>
                </div>
            </main>
        </div>
    );
};

export default AllergyTracker;