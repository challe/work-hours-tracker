import { ChevronLeft, ChevronRight, Clock, MapPin, FileText, Edit, Briefcase } from 'lucide-react';
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="text-[#39ac63] mb-1">Dagar registrerade</div>
          <div className="text-white">{monthEntries.length}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="text-[#39ac63] mb-1">Totala timmar</div>
          <div className="text-white">{totalHoursWorked.toFixed(1)} tim</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="text-[#39ac63] mb-1">Resetimmar</div>
          <div className="text-white">{totalTravelHours.toFixed(1)} tim</div>
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
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white">{formatDate(entry.date)}</div>
                  <div className="text-slate-400">{entry.date}</div>
                </div>
                <button
                  onClick={() => onDateSelect(entry.date)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              {/* Type and Project */}
              {(entry.workTypeName || entry.project) && (
                <div className="flex items-center gap-2 text-[#39ac63] mb-3">
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {entry.workTypeName}{entry.workTypeName && entry.project && ' • '}{entry.project}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4" />
                  <span>{entry.hoursWorked} tim arbetade</span>
                </div>
                {entry.travelHours && parseFloat(entry.travelHours) > 0 && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4" />
                    <span>{entry.travelHours} tim resa</span>
                  </div>
                )}
              </div>

              {(entry.locationFrom || entry.locationTo) && (
                <div className="flex items-center gap-2 text-slate-300 mt-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {entry.locationFrom} {entry.locationFrom && entry.locationTo && '→'} {entry.locationTo}
                  </span>
                </div>
              )}

              {entry.notes && (
                <div className="flex items-start gap-2 text-slate-300 mt-2">
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