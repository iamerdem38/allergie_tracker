import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FoodScore, DailyEntry } from '../types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Chart } from 'react-chartjs-2';
// Die Schreibweise von 'BoxAndWhiskers' wurde zu 'BoxAndWiskers' korrigiert, um den Build-Fehler zu beheben.
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BoxPlotController, BoxAndWiskers);

interface ChartsProps {
    scores: FoodScore[];
    dailyEntries: DailyEntry[];
    foodItems: string[];
}

const Charts: React.FC<ChartsProps> = ({ scores, dailyEntries, foodItems }) => {
    const [sortBy, setSortBy] = useState<'totalScore' | 'averageScore'>('totalScore');
    const [selectedBoxPlotFoods, setSelectedBoxPlotFoods] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const barChartData = useMemo(() => {
        const sortedForScores = [...scores].filter(item => item.count > 0).sort((a, b) => b[sortBy] - a[sortBy]);
        const sortedForCounts = [...scores].filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 15);

        return {
            scores: {
                labels: sortedForScores.map(item => item.food),
                datasets: [{
                    label: sortBy === 'totalScore' ? 'Gesamtpunkte' : 'Durchschnittspunkte',
                    data: sortedForScores.map(item => item[sortBy]),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            counts: {
                labels: sortedForCounts.map(item => item.food),
                datasets: [{
                    label: 'Anzahl der Tage gegessen',
                    data: sortedForCounts.map(item => item.count),
                    backgroundColor: 'rgba(52, 211, 153, 0.5)',
                    borderColor: 'rgba(52, 211, 153, 1)',
                    borderWidth: 1
                }]
            }
        };
    }, [scores, sortBy]);

    const severitiesByFood = useMemo(() => {
        const map = new Map<string, number[]>();
        for (const entry of dailyEntries) {
            for (const food of entry.foods) {
                if (!map.has(food)) {
                    map.set(food, []);
                }
                // Fügen Sie nur positive Juckreizwerte hinzu, um die Verteilung aussagekräftiger zu machen
                if (entry.symptom_severity > 0) {
                    map.get(food)!.push(entry.symptom_severity);
                }
            }
        }
        return map;
    }, [dailyEntries]);

    const boxPlotData = useMemo(() => {
        const counts = scores.map(s => s.count).filter(c => c > 0);
        const minCount = counts.length > 0 ? Math.min(...counts) : 0;
        const maxCount = counts.length > 0 ? Math.max(...counts) : 0;

        const getColorForFood = (food: string) => {
            const score = scores.find(s => s.food === food);
            if (!score || maxCount === minCount) return `hsla(210, 80%, 50%, 0.7)`;

            const ratio = (score.count - minCount) / (maxCount - minCount);
            const lightness = 70 - (ratio * 40); // Skala von 70% (hell) bis 30% (dunkel)
            return `hsla(210, 80%, ${lightness}%, 0.7)`;
        };

        return {
            labels: selectedBoxPlotFoods,
            datasets: [{
                label: 'Juckreiz-Verteilung',
                data: selectedBoxPlotFoods.map(food => severitiesByFood.get(food) || []),
                backgroundColor: selectedBoxPlotFoods.map(getColorForFood),
                borderColor: 'rgba(30, 64, 175, 1)',
                borderWidth: 1,
                itemRadius: 3, // Outlier point radius
            }]
        };
    }, [selectedBoxPlotFoods, severitiesByFood, scores]);

    const chartOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } };
    const boxPlotOptions = { ...chartOptions, scales: { y: { beginAtZero: true, max: 10 } } };
    const scoresTitle = sortBy === 'totalScore' ? 'Lebensmittel-Bewertung (Gesamtpunkte)' : 'Lebensmittel-Bewertung (Durchschnittspunkte)';

    const handleFoodSelection = (food: string) => {
        setSelectedBoxPlotFoods(prev =>
            prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
        );
    };
    
    const sortedFoodItems = useMemo(() => [...foodItems].sort((a,b) => a.localeCompare(b)), [foodItems]);
    
    const handleSelectAllFoods = () => {
        if (selectedBoxPlotFoods.length === sortedFoodItems.length) {
            setSelectedBoxPlotFoods([]);
        } else {
            setSelectedBoxPlotFoods(sortedFoodItems);
        }
    };
    const allSelectedForBoxPlot = selectedBoxPlotFoods.length === sortedFoodItems.length;

    return (
        <div className="flex flex-col space-y-8 items-center mt-8">
            <div className="w-full sm:w-1/2 md:w-1/3 self-center">
                <label htmlFor="chart-sort-select" className="block text-sm font-medium text-gray-700 mb-1 text-center">Balkendiagramme sortieren nach:</label>
                <select id="chart-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'totalScore' | 'averageScore')} className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="totalScore">Gesamtpunkte</option>
                    <option value="averageScore">Durchschnittspunkte</option>
                </select>
            </div>
            <div className="w-full relative h-96">
                <h3 className="text-xl font-medium text-gray-700 mb-2 text-center">{scoresTitle}</h3>
                <Bar options={chartOptions} data={barChartData.scores} />
            </div>
            <div className="w-full relative h-96">
                <h3 className="text-xl font-medium text-gray-700 mb-2 text-center">Anzahl der Tage gegessen (Top 15)</h3>
                <Bar options={chartOptions} data={barChartData.counts} />
            </div>

            {/* NEUER BOX-PLOT BEREICH */}
            <div className="w-full relative pt-8 mt-8 border-t">
                 <h3 className="text-xl font-medium text-gray-700 mb-4 text-center">Juckreiz-Verteilung pro Lebensmittel (Box-Plot)</h3>
                 <div className="relative w-full max-w-md mx-auto mb-4" ref={dropdownRef}>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Lebensmittel auswählen ({selectedBoxPlotFoods.length} ausgewählt)
                            <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={handleSelectAllFoods}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                        >
                            {allSelectedForBoxPlot ? 'Alle abwählen' : 'Alle auswählen'}
                        </button>
                    </div>
                    {isDropdownOpen && (
                        <div className="origin-top-right absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1 max-h-60 overflow-y-auto">
                                {sortedFoodItems.map(food => (
                                     <label key={food} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedBoxPlotFoods.includes(food)}
                                            onChange={() => handleFoodSelection(food)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                        />
                                        {food}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>

                 {selectedBoxPlotFoods.length > 0 ? (
                    <div className="relative h-96">
                        <Chart type={"boxplot" as any} options={boxPlotOptions} data={boxPlotData} />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-4 italic">Bitte wählen Sie Lebensmittel aus, um den Box-Plot anzuzeigen.</p>
                )}
            </div>
        </div>
    );
};

export default Charts;