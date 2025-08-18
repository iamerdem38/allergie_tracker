
import React, { useRef } from 'react';
import { DailyEntry, FoodItem } from '../types';
import { supabase } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';


interface DataManagementProps {
    foodItems: FoodItem[];
    dailyEntries: DailyEntry[];
    onImport: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ foodItems, dailyEntries, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    const handleExport = () => {
        const data = {
            foodItems,
            dailyEntries,
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `allergy_tracker_data_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.foodItems && data.dailyEntries) {
                    // This is a simplified import. A real-world scenario would handle conflicts.
                    // For now, we clear existing data for this user and insert new data.
                    
                    // Clear existing data
                    await supabase.from('daily_entries').delete().eq('user_id', user.id);
                    await supabase.from('food_items').delete().eq('user_id', user.id);
                    
                    // Insert new data
                    const foodsToInsert = data.foodItems.map((f: any) => ({ name: f.name, user_id: user.id }));
                    const entriesToInsert = data.dailyEntries.map((entry: any) => ({
                        date: entry.date,
                        foods: entry.foods,
                        pill_taken: entry.pill_taken,
                        symptom_severity: entry.symptom_severity,
                        user_id: user.id,
                    }));

                    await supabase.from('food_items').insert(foodsToInsert);
                    await supabase.from('daily_entries').insert(entriesToInsert);
                    
                    alert('Daten erfolgreich importiert!');
                    onImport(); // Trigger re-fetch
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                console.error('Import failed:', error);
                alert('Fehler beim Importieren der Daten.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button onClick={handleExport} className="flex-1 px-4 py-2 bg-yellow-500 text-white font-medium rounded-md shadow-sm hover:bg-yellow-600">
                Daten exportieren
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept="application/json" />
            <button onClick={handleImportClick} className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-md shadow-sm hover:bg-purple-700">
                Daten importieren
            </button>
        </div>
    );
};

export default DataManagement;