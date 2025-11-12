import React from 'react';
import { WeatherForecast } from './lookaheadTypes';
import { SunIcon, CloudIcon, CloudRainIcon } from '../Icons';

interface WeatherStripProps {
  startDate: Date;
  totalDays: number;
  weatherData: WeatherForecast[];
  dayWidth: number;
}

const addDays = (date: Date, days: number) => {
    const newDate = new Date(date.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const WeatherIcon: React.FC<{ icon: WeatherForecast['icon'] }> = ({ icon }) => {
    switch(icon) {
        case 'sun': return <SunIcon className="w-4 h-4 text-yellow-500" />;
        case 'cloud': return <CloudIcon className="w-4 h-4 text-gray-500" />;
        case 'rain': return <CloudRainIcon className="w-4 h-4 text-blue-500" />;
        default: return null;
    }
}

const WeatherStrip: React.FC<WeatherStripProps> = ({ startDate, totalDays, weatherData, dayWidth }) => {
    // FIX: Explicitly type the Map to ensure TypeScript correctly infers the type of `forecast`.
    const weatherByDate = new Map<string, WeatherForecast>(weatherData.map(w => [w.date, w]));
    
    // Only show 14 days
    const daysToShow = Math.min(totalDays, 14);

    return (
        <div className="flex items-center" style={{ width: `${daysToShow * dayWidth}px` }}>
            {Array.from({ length: daysToShow }).map((_, i) => {
                const date = addDays(startDate, i);
                const dateString = formatDate(date);
                const forecast = weatherByDate.get(dateString);

                return (
                    <div key={i} className="flex items-center justify-center gap-1 text-xs" style={{ width: `${dayWidth}px` }}>
                        {forecast ? (
                            <>
                               <WeatherIcon icon={forecast.icon} />
                               <span className="font-medium text-gray-600">{forecast.temp}°</span>
                            </>
                        ) : (
                            <span className="text-gray-400">-</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default WeatherStrip;