
import React, { useState, useMemo } from 'react';
import { DailyEntry } from '../types';

interface EntriesTableProps {
    entries: DailyEntry[];
    onDelete: (id: number) => void;
    onEdit: (entry: DailyEntry) => void;
}

const ITEMS_PER_PAGE = 10;

const EntriesTable: React.FC<EntriesTableProps> = ({ entries, onDelete, onEdit }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState({
        date: '',
        severityMin: '',
        severityMax: '',
        scoreMin: '',
        scoreMax: '',
    });

    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            if (filter.date && !e.date.includes(filter.date)) return false;
            if (filter.severityMin && e.symptom_severity < parseInt(filter.severityMin)) return false;
            if (filter.severityMax && e.symptom_severity > parseInt(filter.severityMax)) return false;
            if (filter.scoreMin && (e.finalScore || 0) < parseInt(filter.scoreMin)) return false;
            if (filter.scoreMax && (e.finalScore || 0) > parseInt(filter.scoreMax)) return false;
            return true;
        });
    }, [entries, filter]);

    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
    const paginatedEntries = filteredEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
        setCurrentPage(1);
    };

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <input type="text" name="date" value={filter.date} onChange={handleFilterChange} placeholder="Datum (YYYY-MM-DD)" className="filter-input p-2 border rounded-md" />
                <input type="number" name="severityMin" value={filter.severityMin} onChange={handleFilterChange} placeholder="Juckreiz min" className="filter-input p-2 border rounded-md" />
                <input type="number" name="severityMax" value={filter.severityMax} onChange={handleFilterChange} placeholder="Juckreiz max" className="filter-input p-2 border rounded-md" />
                <input type="number" name="scoreMin" value={filter.scoreMin} onChange={handleFilterChange} placeholder="Punkte min" className="filter-input p-2 border rounded-md" />
                <input type="number" name="scoreMax" value={filter.scoreMax} onChange={handleFilterChange} placeholder="Punkte max" className="filter-input p-2 border rounded-md" />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tablette</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Juckreiz</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lebensmittel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpunkte</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Aktionen</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedEntries.map(entry => (
                            <tr key={entry.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.pill_taken ? 'Ja' : 'Nein'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.symptom_severity}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={entry.foods.join(', ')}>{entry.foods.join(', ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(entry.finalScore || 0).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(entry)} className="text-indigo-600 hover:text-indigo-900 mr-2">Bearbeiten</button>
                                    <button onClick={() => onDelete(entry.id!)} className="text-red-600 hover:text-red-900">Löschen</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-center items-center space-x-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">&lt;</button>
                <span>Seite {currentPage} von {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">&gt;</button>
            </div>
        </div>
    );
};

export default EntriesTable;