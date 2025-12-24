import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { DayEntry } from '../App';

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  entries: Record<string, DayEntry>;
  onDateSelect: (date: string) => void;
}

export function Calendar({ currentMonth, onMonthChange, entries, onDateSelect }: CalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const formatDateKey = (day: number): string => {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0];
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const hasEntry = (day: number): boolean => {
    const dateKey = formatDateKey(day);
    return dateKey in entries;
  };

  const handleDayClick = (day: number) => {
    const dateKey = formatDateKey(day);
    onDateSelect(dateKey);
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isCurrentDay = isToday(day);
    const hasEntryForDay = hasEntry(day);

    days.push(
      <button
        key={day}
        onClick={() => handleDayClick(day)}
        className={`aspect-square rounded-xl transition-all hover:scale-105 active:scale-95 relative flex flex-col items-center justify-center ${
          isCurrentDay && hasEntryForDay
            ? 'bg-[#39ac63] text-white shadow-lg ring-2 ring-white/30'
            : isCurrentDay
            ? 'bg-white/20 text-white shadow-lg ring-2 ring-white/30'
            : hasEntryForDay
            ? 'bg-[#39ac63] text-white shadow-md'
            : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:shadow-md'
        }`}
      >
        <span>{day}</span>
        {!hasEntryForDay && (
          <Plus className="w-3 h-3 absolute bottom-1 right-1 opacity-40" />
        )}
      </button>
    );
  }

  const monthName = currentMonth.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#1b1f27] rounded-2xl shadow-lg p-6 border border-white/10">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-300" />
        </button>
        <h2 className="text-white">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'].map(day => (
          <div key={day} className="text-center text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-center text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/20 ring-2 ring-white/30" />
          <span>Idag</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#39ac63]" />
          <span>Registrerad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center">
            <Plus className="w-3 h-3 text-slate-400" />
          </div>
          <span>Ej registrerad</span>
        </div>
      </div>
    </div>
  );
}