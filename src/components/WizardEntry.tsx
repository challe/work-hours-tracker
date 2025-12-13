import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Copy } from 'lucide-react';
import type { DayEntry } from '../App';

interface WizardEntryProps {
  date: string;
  existingEntry?: DayEntry;
  previousEntry?: DayEntry;
  onSave: (entry: DayEntry) => void;
  onCancel: () => void;
}

const steps = [
  { id: 'hoursWorked', label: 'Arbetade timmar', type: 'number', placeholder: '8.0' },
  { id: 'travelHours', label: 'Resetimmar', type: 'number', placeholder: '0.0' },
  { id: 'locationFrom', label: 'Från plats', type: 'text', placeholder: 'Hemmet / Kontoret' },
  { id: 'locationTo', label: 'Till plats', type: 'text', placeholder: 'Kontoret / Kundplats' },
  { id: 'notes', label: 'Anteckningar', type: 'textarea', placeholder: 'Eventuella anteckningar för dagen...' },
];

export function WizardEntry({ date, existingEntry, previousEntry, onSave, onCancel }: WizardEntryProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [entry, setEntry] = useState<DayEntry>(
    existingEntry || {
      date,
      hoursWorked: '',
      travelHours: '',
      locationFrom: '',
      locationTo: '',
      notes: '',
    }
  );

  const currentField = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const handleNext = () => {
    if (isLastStep) {
      onSave(entry);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onCancel();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCopyPrevious = () => {
    if (previousEntry) {
      const fieldId = currentField.id as keyof DayEntry;
      setEntry(prev => ({
        ...prev,
        [fieldId]: previousEntry[fieldId] || ''
      }));
    }
  };

  const handleChange = (value: string) => {
    setEntry(prev => ({
      ...prev,
      [currentField.id]: value
    }));
  };

  const getCurrentValue = () => {
    return entry[currentField.id as keyof DayEntry] || '';
  };

  const canCopyPrevious = previousEntry && previousEntry[currentField.id as keyof DayEntry];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Date display - outside card */}
        <div className="text-center mb-6">
          <div className="text-white/50">Registrerar för</div>
          <div className="text-white/80 text-xl">{formatDate(date)}</div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 text-white/70 text-center text-xl">
            Steg {currentStep + 1} av {steps.length}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-16">
          {/* Current question */}
          <div className="mb-10">
            <label className="block text-center mb-8">
              <span className="text-slate-700 text-3xl">{currentField.label}</span>
            </label>

            {currentField.type === 'textarea' ? (
              <textarea
                value={getCurrentValue()}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={currentField.placeholder}
                className="w-full px-8 py-12 text-center text-slate-900 bg-slate-50 border-4 border-slate-200 rounded-3xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-64 resize-none text-2xl"
                autoFocus
              />
            ) : (
              <input
                type={currentField.type}
                value={getCurrentValue()}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={currentField.placeholder}
                step={currentField.type === 'number' ? '0.5' : undefined}
                inputMode={currentField.type === 'number' ? 'decimal' : 'text'}
                className="w-full px-8 py-12 text-center text-slate-900 bg-slate-50 border-4 border-slate-200 rounded-3xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-6xl"
                autoFocus
              />
            )}

            {/* Copy from previous day button */}
            {canCopyPrevious && (
              <button
                onClick={handleCopyPrevious}
                className="mt-6 w-full py-5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center justify-center gap-3 text-xl"
              >
                <Copy className="w-6 h-6" />
                Kopiera från föregående dag
              </button>
            )}
          </div>

          {/* Next button - full width on its own */}
          <button
            onClick={handleNext}
            className="w-full py-8 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-3xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-3xl mb-4"
          >
            {isLastStep ? (
              <>
                <Check className="w-8 h-8" />
                Spara
              </>
            ) : (
              <>
                Nästa
                <ChevronRight className="w-8 h-8" />
              </>
            )}
          </button>

          {/* Back button - smaller, dimmed, below */}
          <button
            onClick={handleBack}
            className="w-full py-4 px-6 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            {currentStep === 0 ? 'Avbryt' : 'Tillbaka'}
          </button>
        </div>
      </div>
    </div>
  );
}