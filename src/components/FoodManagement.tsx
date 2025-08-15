
import React, { useState, useMemo } from 'react';

interface FoodManagementProps {
    foodItems: string[];
    onAddFood: (name: string) => void;
}

const FoodManagement: React.FC<FoodManagementProps> = ({ foodItems, onAddFood }) => {
    const [newFood, setNewFood] = useState('');
    const [error, setError] = useState('');

    const handleAddFood = () => {
        const trimmedFood = newFood.trim();
        if (trimmedFood && !foodItems.includes(trimmedFood)) {
            onAddFood(trimmedFood);
            setNewFood('');
            setError('');
        } else if (foodItems.includes(trimmedFood)) {
            setError('Lebensmittel existiert bereits!');
        }
    };

    const sortedFoodItems = useMemo(() => [...foodItems].sort((a,b) => a.localeCompare(b)), [foodItems]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lebensmittel-Verwaltung</h2>
            <div className="flex space-x-2 mb-2">
                <input
                    type="text"
                    value={newFood}
                    onChange={(e) => setNewFood(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFood()}
                    placeholder="Neues Lebensmittel hinzufügen"
                    className="flex-grow rounded-md border-gray-300 shadow-sm p-2"
                />
                <button
                    onClick={handleAddFood}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700"
                >
                    Hinzufügen
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <ul className="list-disc list-inside space-y-1 text-gray-600 max-h-40 overflow-y-auto p-2 border rounded-md bg-gray-50">
                {sortedFoodItems.map(food => <li key={food}>{food}</li>)}
            </ul>
        </div>
    );
};

export default FoodManagement;