
import React, { useState, useMemo } from 'react';
import { FoodScore } from '../types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartsProps {
    scores: FoodScore[];
}

const Charts: React.FC<ChartsProps> = ({ scores }) => {
    const [sortBy, setSortBy] = useState<'totalScore' | 'averageScore'>('totalScore');

    const chartData = useMemo(() => {
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Wert', color: '#4b5563' } } }
    };
    
    const scoresTitle = sortBy === 'totalScore' ? 'Lebensmittel-Bewertung (Gesamtpunkte)' : 'Lebensmittel-Bewertung (Durchschnittspunkte)';

    return (
        <div className="flex flex-col space-y-8 items-center mt-8">
            <div className="w-full sm:w-1/2 md:w-1/3 self-center">
                <label htmlFor="chart-sort-select" className="block text-sm font-medium text-gray-700 mb-1 text-center">Diagramme sortieren nach:</label>
                <select id="chart-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'totalScore' | 'averageScore')} className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="totalScore">Gesamtpunkte</option>
                    <option value="averageScore">Durchschnittspunkte</option>
                </select>
            </div>
            <div className="w-full relative h-96">
                <h3 className="text-xl font-medium text-gray-700 mb-2 text-center">{scoresTitle}</h3>
                <Bar options={chartOptions} data={chartData.scores} />
            </div>
            <div className="w-full relative h-96">
                <h3 className="text-xl font-medium text-gray-700 mb-2 text-center">Anzahl der Tage gegessen (Top 15)</h3>
                <Bar options={chartOptions} data={chartData.counts} />
            </div>
        </div>
    );
};

export default Charts;