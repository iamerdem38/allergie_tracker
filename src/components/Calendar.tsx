import React, { useState, useMemo } from 'react';
import { DailyEntry } from '../types';
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay } from 'date-fns';
import { de } from 'date-fns/locale/de';

interface CalendarProps {
    dailyEntries: DailyEntry[];
}

type CalendarDay = {
    key: string;
    isEmpty: true;
    day?: undefined;
    entry?: undefined;
} | {
    key: string;
    isEmpty: false;
    day: string;
    entry: DailyEntry | undefined;
};


const Calendar: React.FC<CalendarProps> = ({ dailyEntries }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [view, setView] = useState<'pills' | 'entries'>('pills');

    const calendarDays = useMemo(() => {
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        const entriesMap = new Map(dailyEntries.map(e => [e.date, e]));
        
        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        let startingDayIndex = getDay(start);
        startingDayIndex = startingDayIndex === 0 ? 6 : startingDayIndex - 1;

        const emptyDays: CalendarDay[] = Array.from({ length: startingDayIndex }, (_, i) => ({
            key: `empty-${i}`,
            isEmpty: true,
        }));

        const filledDays: CalendarDay[] = days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            return {
                key: dateStr,
                isEmpty: false,
                day: format(day, 'd'),
                entry: entriesMap.get(dateStr),
            };
        });

        return [...emptyDays, ...filledDays];
    }, [currentMonth, dailyEntries]);

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-gray-700">Kalender</h3>
                <div className="flex items-center space-x-4 text-sm">
                    <label>
                        <input type="radio" name="calendarView" value="pills" checked={view === 'pills'} onChange={() => setView('pills')} className="mr-1" />
                        Tablette genommen
                    </label>
                    <label>
                        <input type="radio" name="calendarView" value="entries" checked={view === 'entries'} onChange={() => setView('entries')} className="mr-1" />
                        Tage mit Eintrag
                    </label>
                </div>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&lt;</button>
                    <span className="font-semibold text-lg">{format(currentMonth, 'MMMM yyyy', { locale: de })}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
                    <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mt-2">
                    {calendarDays.map(d => {
                        if (d.isEmpty) return <div key={d.key}></div>;

                        let className = 'p-2 rounded-md font-medium';
                        if (view === 'pills' && d.entry?.pill_taken) {
                            className += ' bg-blue-500 text-white shadow-md';
                        } else if (view === 'entries' && d.entry) {
                            className += ' bg-yellow-400 text-gray-800 shadow-md';
                        }

                        return <div key={d.key} className={className}>{d.day}</div>;
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;