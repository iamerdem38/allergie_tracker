
import React, { useState, useMemo } from 'react';
import { FoodScore } from '../types';

interface FoodRankingTableProps {
    scores: FoodScore[];
}

type SortKey = keyof FoodScore | 'rank';
type SortDirection = 'asc' | 'desc';

const FoodRankingTable: React.FC<FoodRankingTableProps> = ({ scores }) => {
    const [minDays, setMinDays] = useState('');
    const [maxDays, setMaxDays] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'totalScore', direction: 'desc' });

    const filteredAndSortedScores = useMemo(() => {
        let filtered = [...scores];

        const min = parseFloat(minDays);
        if (!isNaN(min)) {
            filtered = filtered.filter(item => item.count >= min);
        }
        const max = parseFloat(maxDays);
        if (!isNaN(max)) {
            filtered = filtered.filter(item => item.count <= max);
        }

        filtered.sort((a, b) => {
            if (sortConfig.key === 'food') {
                return sortConfig.direction === 'asc' 
                    ? a.food.localeCompare(b.food) 
                    : b.food.localeCompare(a.food);
            }
            if (a[sortConfig.key as keyof FoodScore] < b[sortConfig.key as keyof FoodScore]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key as keyof FoodScore] > b[sortConfig.key as keyof FoodScore]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [scores, minDays, maxDays, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key !== key) {
            direction = key === 'food' ? 'asc' : 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorted = sortConfig.key === sortKey;
        const icon = isSorted ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '';
        return (
            <th onClick={() => requestSort(sortKey)} className="sortable-header px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                {children} {icon}
            </th>
        );
    };

    return (
        <div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Lebensmittel-Bewertung</h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4 p-4 bg-gray-50 rounded-md shadow-sm">
                <label className="flex-1">
                    <span className="text-sm font-medium text-gray-700">Min. Tage gegessen:</span>
                    <input type="number" value={minDays} onChange={(e) => setMinDays(e.target.value)} placeholder="z.B. 1" className="filter-input mt-1 w-full p-2 border rounded-md" />
                </label>
                <label className="flex-1">
                    <span className="text-sm font-medium text-gray-700">Max. Tage gegessen:</span>
                    <input type="number" value={maxDays} onChange={(e) => setMaxDays(e.target.value)} placeholder="z.B. 10" className="filter-input mt-1 w-full p-2 border rounded-md" />
                </label>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <SortableHeader sortKey="food">Lebensmittel</SortableHeader>
                            <SortableHeader sortKey="count">Anzahl Tage</SortableHeader>
                            <SortableHeader sortKey="totalScore">Gesamtwert</SortableHeader>
                            <SortableHeader sortKey="averageScore">Ø Wert</SortableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedScores.map((item, index) => (
                            <tr key={item.food}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.food}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalScore.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.averageScore.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredAndSortedScores.length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm italic">Keine Daten für die aktuelle Filterauswahl vorhanden.</p>
                )}
            </div>
        </div>
    );
};

export default FoodRankingTable;