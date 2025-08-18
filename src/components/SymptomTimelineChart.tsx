import React, { useState, useMemo } from 'react';
import { DailyEntry } from '../types';
import { format } from 'date-fns';
import { subDays } from 'date-fns/subDays';
import { parseISO } from 'date-fns/parseISO';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, TimeScale, TimeSeriesScale } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    TimeSeriesScale
);

interface SymptomTimelineChartProps {
    dailyEntries: DailyEntry[];
}

const SymptomTimelineChart: React.FC<SymptomTimelineChartProps> = ({ dailyEntries }) => {
    const [timeRange, setTimeRange] = useState<number>(30); // Default to last 30 days

    const chartData = useMemo(() => {
        const sortedEntries = [...dailyEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const now = new Date();
        const filteredEntries = timeRange === Infinity
            ? sortedEntries
            : sortedEntries.filter(entry => new Date(entry.date) >= subDays(now, timeRange));

        if (filteredEntries.length === 0) {
            return null;
        }

        const labels = filteredEntries.map(entry => parseISO(entry.date));
        
        return {
            labels,
            datasets: [
                {
                    type: 'line' as const,
                    label: 'Juckreiz',
                    data: filteredEntries.map(entry => entry.symptom_severity),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    yAxisID: 'y1',
                    tension: 0.1,
                },
                {
                    type: 'bar' as const,
                    label: 'Tablette',
                    data: filteredEntries.map(entry => entry.pill_taken ? 1 : 0),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    yAxisID: 'y2',
                },
            ],
        };
    }, [dailyEntries, timeRange]);

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: function(context: any) {
                        return format(new Date(context[0].label), 'dd.MM.yyyy');
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time' as const,
                time: {
                    unit: 'day',
                    tooltipFormat: 'dd.MM.yyyy',
                    displayFormats: {
                        day: 'dd.MM'
                    }
                },
                title: {
                    display: true,
                    text: 'Datum'
                }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                min: 0,
                max: 10,
                title: {
                    display: true,
                    text: 'Juckreiz-Stärke',
                },
            },
            y2: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                min: 0,
                max: 1,
                ticks: {
                    stepSize: 1,
                    callback: function(value: any) {
                        if (value === 1) return 'Ja';
                        if (value === 0) return 'Nein';
                        return null;
                    },
                },
                grid: {
                    drawOnChartArea: false, // only draw grid for y1
                },
                 title: {
                    display: true,
                    text: 'Tablette genommen',
                },
            },
        },
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-medium text-gray-700 text-center sm:text-left">
                    Zeitverlauf: Juckreiz & Tabletten
                </h3>
                 <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(Number(e.target.value))}
                    className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={30}>Letzte 30 Tage</option>
                    <option value={60}>Letzte 60 Tage</option>
                    <option value={90}>Letzte 90 Tage</option>
                    <option value={180}>Letzte 180 Tage</option>
                    <option value={365}>Letzte 365 Tage</option>
                    <option value={Infinity}>Gesamter Zeitraum</option>
                </select>
            </div>
            <div className="relative h-96">
                {chartData ? (
                    <Chart type='bar' options={chartOptions} data={chartData} />
                ) : (
                    <p className="text-center text-gray-500 mt-4 italic">
                        Keine Daten für den ausgewählten Zeitraum vorhanden.
                    </p>
                )}
            </div>
        </div>
    );
};

export default SymptomTimelineChart;