import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DailyEntry } from '../types';
import { differenceInDays } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController);

interface DaysSinceLastEatenChartProps {
    dailyEntries: DailyEntry[];
    foodItems: string[];
}

const LOCAL_STORAGE_KEY = 'daysSinceChartSelectedFoods';

const DaysSinceLastEatenChart: React.FC<DaysSinceLastEatenChartProps> = ({ dailyEntries, foodItems }) => {
    const [selectedFoods, setSelectedFoods] = useState<string[]>(() => {
        try {
            const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    });
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedFoods));
        } catch (error) {
            console.error(error);
        }
    }, [selectedFoods]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const chartDataAndLogic = useMemo(() => {
        if (selectedFoods.length === 0) {
            return null;
        }

        const lastEatenMap = new Map<string, string>();
        const sortedEntries = [...dailyEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        for (const entry of sortedEntries) {
            for (const food of entry.foods) {
                if (!lastEatenMap.has(food)) {
                    lastEatenMap.set(food, entry.date);
                }
            }
        }
        
        const today = new Date();
        const dataPoints = selectedFoods
            .map(food => {
                const lastDateStr = lastEatenMap.get(food);
                if (!lastDateStr) {
                    return null;
                }
                const daysSince = differenceInDays(today, new Date(lastDateStr));
                return { food, daysSince };
            })
            .filter((item): item is { food: string, daysSince: number } => item !== null);

        dataPoints.sort((a, b) => b.daysSince - a.daysSince);

        const chartData = {
            labels: dataPoints.map(p => p.food),
            datasets: [
                {
                    label: 'Tage seit letztem Verzehr',
                    data: dataPoints.map(p => p.daysSince),
                    backgroundColor: 'rgba(139, 92, 246, 0.5)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1,
                },
            ],
        };
        
        return chartData;

    }, [selectedFoods, dailyEntries]);

    const handleFoodSelection = (food: string) => {
        setSelectedFoods(prev =>
            prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
        );
    };

    const sortedFoodItems = useMemo(() => [...foodItems].sort((a, b) => a.localeCompare(b)), [foodItems]);
    const chartOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'Tage' } }, x: { title: { display: true, text: 'Lebensmittel' } } } };

    const handleSelectAllFoods = () => {
        if (selectedFoods.length === sortedFoodItems.length) {
            setSelectedFoods([]);
        } else {
            setSelectedFoods(sortedFoodItems);
        }
    };
    const allSelected = selectedFoods.length === sortedFoodItems.length;

    return (
        <div>
            <h3 className="text-xl font-medium text-gray-700 mb-4 text-center">Tage seit letztem Verzehr</h3>
            <div className="relative w-full max-w-md mx-auto mb-4" ref={dropdownRef}>
                 <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Lebensmittel auswählen ({selectedFoods.length} ausgewählt)
                        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                     <button
                        type="button"
                        onClick={handleSelectAllFoods}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                    >
                        {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
                    </button>
                </div>
                {isDropdownOpen && (
                    <div className="origin-top-right absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1 max-h-60 overflow-y-auto">
                            {sortedFoodItems.map(food => (
                                <label key={food} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedFoods.includes(food)}
                                        onChange={() => handleFoodSelection(food)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3"
                                    />
                                    {food}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative h-96 mt-4">
                {chartDataAndLogic ? (
                    <Bar options={chartOptions} data={chartDataAndLogic} />
                ) : (
                    <p className="text-center text-gray-500 mt-4 italic">Bitte wählen Sie Lebensmittel aus, um das Diagramm anzuzeigen.</p>
                )}
            </div>
        </div>
    );
};

export default DaysSinceLastEatenChart;