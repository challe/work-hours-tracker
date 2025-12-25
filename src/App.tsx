import { useState } from 'react';
import { Calendar } from './components/Calendar';
import { WizardEntry } from './components/WizardEntry';
import { MonthlyOverview } from './components/MonthlyOverview';
import { TreePine } from 'lucide-react';

export interface DayEntry {
  date: string; // YYYY-MM-DD format
  workTypeId: number;
  workTypeName: string;
  project: string;
  hoursWorked: string;
  travelHours: string;
  locationFrom: string;
  locationTo: string;
  notes: string;
}

export default function App() {
  const [entries, setEntries] = useState<Record<string, DayEntry>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'overview'>('calendar');

  const handleSaveEntry = (entry: DayEntry) => {
    setEntries(prev => ({
      ...prev,
      [entry.date]: entry
    }));
    setSelectedDate(null);
  };

  const handleCancelEntry = () => {
    setSelectedDate(null);
  };

  const getEntryForDate = (date: string): DayEntry | undefined => {
    return entries[date];
  };

  const getPreviousEntry = (date: string): DayEntry | undefined => {
    const currentDate = new Date(date);
    const dates = Object.keys(entries).sort();
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const entryDate = new Date(dates[i]);
      if (entryDate < currentDate) {
        return entries[dates[i]];
      }
    }
    
    return undefined;
  };

  if (selectedDate) {
    return (
      <WizardEntry
        date={selectedDate}
        existingEntry={getEntryForDate(selectedDate)}
        previousEntry={getPreviousEntry(selectedDate)}
        onSave={handleSaveEntry}
        onCancel={handleCancelEntry}
      />
    );
  }

  return (
    <div className="app min-h-screen bg-gradient-to-br from-[#101318] to-[#1b1f27]">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView('calendar')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${
              view === 'calendar'
                ? 'bg-[#39ac63] text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Kalender
          </button>
          <button
            onClick={() => setView('overview')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${
              view === 'overview'
                ? 'bg-[#39ac63] text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Översikt
          </button>
        </div>

        {view === 'calendar' ? (
          <Calendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            entries={entries}
            onDateSelect={setSelectedDate}
          />
        ) : (
          <MonthlyOverview
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            entries={entries}
            onDateSelect={setSelectedDate}
          />
        )}
      </div>
    </div>
  );
}