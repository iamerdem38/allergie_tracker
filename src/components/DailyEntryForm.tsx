import React, { useState, useEffect, useMemo } from 'react';
import { DailyEntry } from '../types';
import { isNextDay, calculateDailyScore } from '../services/calculationService';
import Modal from './Modal';

interface DailyEntryFormProps {
    foodItems: string[];
    onSubmit: (entry: Omit<DailyEntry, 'id' | 'user_id' | 'finalScore'>) => void;
    dailyEntries: DailyEntry[];
    entryToEdit: DailyEntry | null;
}

const DailyEntryForm: React.FC<DailyEntryFormProps> = ({ foodItems, onSubmit, dailyEntries, entryToEdit }) => {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
    const [pillTaken, setPillTaken] = useState(false);
    const [symptomSeverity, setSymptomSeverity] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [foodSearchTerm, setFoodSearchTerm] = useState('');

    useEffect(() => {
        if (entryToEdit) {
            setDate(entryToEdit.date);
            setSelectedFoods(entryToEdit.foods);
            setPillTaken(entryToEdit.pill_taken);
            setSymptomSeverity(entryToEdit.symptom_severity);
        }
    }, [entryToEdit]);

    const sortedFoodItems = useMemo(() => [...foodItems].sort((a, b) => a.localeCompare(b)), [foodItems]);

    const filteredFoodItems = useMemo(() => {
        if (!foodSearchTerm) {
            return sortedFoodItems;
        }
        return sortedFoodItems.filter(food =>
            food.toLowerCase().includes(foodSearchTerm.toLowerCase())
        );
    }, [sortedFoodItems, foodSearchTerm]);

    const handleFoodChange = (food: string) => {
        setSelectedFoods(prev =>
            prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
        );
    };

    const handleSubmit = (e: React.FormEvent, confirmed = false) => {
        e.preventDefault();
        const existingEntry = dailyEntries.find(entry => entry.date === date && (!entryToEdit || entryToEdit.date !== date));
        
        if (existingEntry && !confirmed) {
            setShowConfirmModal(true);
            return;
        }

        onSubmit({ date, foods: selectedFoods, pill_taken: pillTaken, symptom_severity: symptomSeverity });
        
        if (!entryToEdit) {
            // Reset form only if it's a new entry
            setDate(new Date().toISOString().slice(0, 10));
            setSelectedFoods([]);
            setPillTaken(false);
            setSymptomSeverity(0);
            setFoodSearchTerm('');
        }

        setShowConfirmModal(false);
    };

    const calculatedScoreDisplay = useMemo(() => {
        const currentEntryForCalc = { date, symptom_severity: symptomSeverity, pill_taken: pillTaken };

        // Find the real entries that would be previous and next to the current date.
        const sortedEntries = dailyEntries
            .filter(e => e.date !== date) // Exclude entry on the same day if we're editing
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Find the index where our new/edited entry would be inserted.
        const insertionIndex = sortedEntries.findIndex(e => new Date(e.date) > new Date(date));
        const finalIndex = insertionIndex === -1 ? sortedEntries.length : insertionIndex;

        const tempPrev = finalIndex > 0 ? sortedEntries[finalIndex - 1] : null;
        const tempNext = finalIndex < sortedEntries.length ? sortedEntries[finalIndex] : null;

        // Verify they are chronologically adjacent to the current date.
        const prev = (tempPrev && isNextDay(tempPrev.date, currentEntryForCalc.date)) ? tempPrev : null;
        const next = (tempNext && isNextDay(currentEntryForCalc.date, tempNext.date)) ? tempNext : null;

        const { score, calculation } = calculateDailyScore(currentEntryForCalc, prev, next);

        return (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700 leading-relaxed">
                <strong className="block text-base mb-2">Berechnung des Endpunkts:</strong>
                Juckreiz-Summe = (Heute: {calculation.currentSeverity}) + (Morgen: {calculation.nextDaySeverity}) = <strong>{calculation.totalSeverity}</strong><br/>
                Basis-Score = Juckreiz-Summe / 10 = <strong>{calculation.itchScore.toFixed(2)}</strong><br/>
                Tabletten-Multiplikator = <strong>{calculation.pillMultiplier}</strong> <span className="text-gray-500">({calculation.pillReason})</span><br/>
                <strong className="block mt-2">Endpunkt = {calculation.itchScore.toFixed(2)} &times; {calculation.pillMultiplier} = {score.toFixed(2)}</strong>
            </div>
        );
    }, [date, symptomSeverity, pillTaken, dailyEntries]);

    return (
        <>
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">{entryToEdit ? 'Eintrag bearbeiten' : 'Täglicher Eintrag'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="entry-date" className="block text-sm font-medium text-gray-700">Datum:</label>
                        <input type="date" id="entry-date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gegessene Lebensmittel:</label>
                        <input
                            type="text"
                            placeholder="Lebensmittel suchen..."
                            value={foodSearchTerm}
                            onChange={e => setFoodSearchTerm(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 mb-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="food-checkbox-list max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
                            {filteredFoodItems.map(food => (
                                <label key={food} className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={food}
                                        checked={selectedFoods.includes(food)}
                                        onChange={() => handleFoodChange(food)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                    />
                                    {food}
                                </label>
                            ))}
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <input type="checkbox" id="pill-taken" checked={pillTaken} onChange={e => setPillTaken(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="pill-taken" className="text-sm font-medium text-gray-700">Allergie-Tablette eingenommen?</label>
                    </div>
                    <div>
                        <label htmlFor="symptom-severity" className="block text-sm font-medium text-gray-700">Allergiebeschwerden (Juckreiz):</label>
                        <div className="mt-1 flex items-center space-x-3">
                            <span className="text-sm text-gray-500">Keine</span>
                            <input type="range" id="symptom-severity" min="0" max="10" value={symptomSeverity} onChange={e => setSymptomSeverity(parseInt(e.target.value, 10))} className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            <span className="text-sm text-gray-500">Stark</span>
                            <span id="severity-value" className="w-8 text-center text-sm font-semibold text-gray-700">{symptomSeverity}</span>
                        </div>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700">
                        {entryToEdit ? 'Eintrag aktualisieren' : 'Eintrag speichern'}
                    </button>
                    {calculatedScoreDisplay}
                </form>
            </div>
            {showConfirmModal && (
                <Modal
                    title="Eintrag überschreiben?"
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={(e) => handleSubmit(e, true)}
                >
                    <p className="text-sm text-gray-500">Für das Datum "{date}" existiert bereits ein Eintrag. Möchten Sie diesen ersetzen?</p>
                </Modal>
            )}
        </>
    );
};

export default DailyEntryForm;