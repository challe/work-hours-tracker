import { ChevronLeft, ChevronRight, Clock, MapPin, FileText, Edit } from 'lucide-react';
import type { DayEntry } from '../App';

interface MonthlyOverviewProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  entries: Record<string, DayEntry>;
  onDateSelect: (date: string) => void;
}

export function MonthlyOverview({ currentMonth, onMonthChange, entries, onDateSelect }: MonthlyOverviewProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const previousMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });

  // Get all entries for current month
  const monthEntries = Object.values(entries)
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === month && entryDate.getFullYear() === year;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate totals
  const totalHoursWorked = monthEntries.reduce((sum, entry) => {
    return sum + (parseFloat(entry.hoursWorked) || 0);
  }, 0);

  const totalTravelHours = monthEntries.reduce((sum, entry) => {
    return sum + (parseFloat(entry.travelHours) || 0);
  }, 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('sv-SE', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="text-slate-800">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
          <div className="text-indigo-600 mb-1">Dagar registrerade</div>
          <div className="text-indigo-900">{monthEntries.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="text-purple-600 mb-1">Totala timmar</div>
          <div className="text-purple-900">{totalHoursWorked.toFixed(1)} tim</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="text-blue-600 mb-1">Resetimmar</div>
          <div className="text-blue-900">{totalTravelHours.toFixed(1)} tim</div>
        </div>
      </div>

      {/* Entries list */}
      <div className="space-y-3">
        {monthEntries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Inga registreringar denna månad</p>
          </div>
        ) : (
          monthEntries.map(entry => (
            <div
              key={entry.date}
              className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-slate-800">{formatDate(entry.date)}</div>
                  <div className="text-slate-500">{entry.date}</div>
                </div>
                <button
                  onClick={() => onDateSelect(entry.date)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{entry.hoursWorked} tim arbetade</span>
                </div>
                {entry.travelHours && parseFloat(entry.travelHours) > 0 && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{entry.travelHours} tim resa</span>
                  </div>
                )}
              </div>

              {(entry.locationFrom || entry.locationTo) && (
                <div className="flex items-center gap-2 text-slate-600 mt-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {entry.locationFrom} {entry.locationFrom && entry.locationTo && '→'} {entry.locationTo}
                  </span>
                </div>
              )}

              {entry.notes && (
                <div className="flex items-start gap-2 text-slate-600 mt-2">
                  <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{entry.notes}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}