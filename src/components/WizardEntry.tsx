import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, Copy, ChevronDown } from 'lucide-react';
import type { DayEntry } from '../App';

interface WizardEntryProps {
  date: string;
  existingEntry?: DayEntry;
  previousEntry?: DayEntry;
  onSave: (entry: DayEntry) => void;
  onCancel: () => void;
}

// Database-ready structures
interface WorkType {
  id: number;
  name: string;
}

interface FieldConfig {
  id: keyof DayEntry;
  label: string;
  type: 'text' | 'number' | 'textarea';
  placeholder?: string;
  workTypeIds: number[]; // Which work types should show this field
}

// These would come from a database
const workTypes: WorkType[] = [
  { id: 1, name: 'Skotare' },
  { id: 2, name: 'Skördare' },
  { id: 3, name: 'Manuell huggare' },
];

const projects = ['LG123', 'LG456', 'LG789'];

// Field configurations - each field specifies which work types should see it
const fieldConfigs: FieldConfig[] = [
  { 
    id: 'hoursWorked', 
    label: 'Arbetade timmar', 
    type: 'number',
    workTypeIds: [1, 2, 3] // All types
  },
  { 
    id: 'travelHours', 
    label: 'Resetimmar', 
    type: 'number',
    workTypeIds: [1, 2, 3] // All types
  },
  { 
    id: 'locationFrom', 
    label: 'Från plats', 
    type: 'text',
    workTypeIds: [1, 2] // Only Skotare and Skördare
  },
  { 
    id: 'locationTo', 
    label: 'Till plats', 
    type: 'text',
    workTypeIds: [1, 2] // Only Skotare and Skördare
  },
  { 
    id: 'notes', 
    label: 'Anteckningar', 
    type: 'textarea',
    workTypeIds: [1, 2, 3] // All types
  },
];

export function WizardEntry({ date, existingEntry, previousEntry, onSave, onCancel }: WizardEntryProps) {
  const [isSetupPhase, setIsSetupPhase] = useState(!existingEntry);
  const [currentStep, setCurrentStep] = useState(0);
  const [entry, setEntry] = useState<DayEntry>(
    existingEntry || {
      date,
      workTypeId: previousEntry?.workTypeId || 0,
      workTypeName: previousEntry?.workTypeName || '',
      project: previousEntry?.project || '',
      hoursWorked: '',
      travelHours: '',
      locationFrom: '',
      locationTo: '',
      notes: '',
    }
  );
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const blurRef = useRef<HTMLLabelElement>(null);

  // Focus input when step changes
  useEffect(() => {
    if (!isSetupPhase) {
      inputRef.current.focus();
    }
  }, []);

  // Get applicable fields based on selected work type
  const getApplicableFields = (): FieldConfig[] => {
    if (!entry.workTypeId) return [];
    return fieldConfigs.filter(field => 
      field.workTypeIds.includes(entry.workTypeId)
    );
  };

  const applicableFields = getApplicableFields();
  const totalSteps = applicableFields.length;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const handleSetupComplete = () => {
    if (entry.workTypeId && entry.project) {
      setIsSetupPhase(false);
      setCurrentStep(0);
    }
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
      // Go back to setup
      setIsSetupPhase(true);
      setCurrentStep(0);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCancelFromSetup = () => {
    onCancel();
  };

  const handleCopyPrevious = () => {
    if (previousEntry && !isSetupPhase) {
      const currentField = applicableFields[currentStep];
      if (currentField && previousEntry[currentField.id]) {
        setEntry(prev => ({
          ...prev,
          [currentField.id]: previousEntry[currentField.id]
        }));
      }
    }
  };

  const handleCopySetupFromPrevious = () => {
    if (previousEntry) {
      setEntry(prev => ({
        ...prev,
        workTypeId: previousEntry.workTypeId,
        workTypeName: previousEntry.workTypeName,
        project: previousEntry.project,
      }));
    }
  };

  const handleCopyEntireDay = () => {
    if (previousEntry) {
      // Copy all fields from previous day and save immediately
      onSave({
        ...previousEntry,
        date, // Keep current date
      });
    }
  };

  const handleChange = (fieldId: keyof DayEntry, value: string | number) => {
    setEntry(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleWorkTypeChange = (workTypeId: number) => {
    const workType = workTypes.find(wt => wt.id === workTypeId);
    setEntry(prev => ({
      ...prev,
      workTypeId,
      workTypeName: workType?.name || '',
    }));
  };

  const canCopyPrevious = !isSetupPhase && previousEntry && applicableFields[currentStep] && 
    previousEntry[applicableFields[currentStep].id];

  const canCopySetup = isSetupPhase && previousEntry && previousEntry.workTypeId;

  // Setup phase - choosing work type and project
  if (isSetupPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101318] to-[#1b1f27] flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Date display */}
          <div className="text-center mb-6">
            <div className="text-slate-400">Registrerar för</div>
            <div className="text-white/90 text-xl">{formatDate(date)}</div>
          </div>

          {/* No progress bar during setup */}

          {/* Main card */}
          <div className="bg-[#1b1f27] rounded-3xl shadow-2xl p-8 sm:p-16 border border-white/10">
            {/* Work Type Selection */}
            <div className="mb-6">
              <div className="relative">
                <select
                  value={entry.workTypeId || ''}
                  onChange={(e) => handleWorkTypeChange(Number(e.target.value))}
                  className="w-full px-8 py-8 text-center text-white bg-[#101318] border-4 border-white/20 rounded-3xl focus:outline-none focus:border-[#39ac63] transition-all text-3xl appearance-none cursor-pointer"
                  autoFocus={!!entry.workTypeId}
                >
                  <option value="" disabled className="bg-[#1b1f27] text-slate-400">
                    Arbete
                  </option>
                  {workTypes.map(type => (
                    <option key={type.id} value={type.id} className="bg-[#1b1f27] text-white">
                      {type.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-white pointer-events-none" />
              </div>
            </div>

            {/* Project Selection */}
            <div className="mb-10">
              <div className="relative">
                <select
                  value={entry.project}
                  onChange={(e) => handleChange('project', e.target.value)}
                  className="w-full px-8 py-8 text-center text-white bg-[#101318] border-4 border-white/20 rounded-3xl focus:outline-none focus:border-[#39ac63] transition-all text-3xl appearance-none cursor-pointer"
                  disabled={!entry.workTypeId}
                >
                  <option value="" disabled className="bg-[#1b1f27] text-slate-400">
                    Projekt
                  </option>
                  {projects.map(project => (
                    <option key={project} value={project} className="bg-[#1b1f27] text-white">
                      {project}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-white pointer-events-none" />
              </div>
            </div>

            {/* Copy entire day and save immediately */}
            {canCopySetup && (
              <button
                onClick={handleCopyEntireDay}
                className="mt-6 mb-6 w-full py-5 px-6 bg-white/10 hover:bg-white/20 text-slate-200 rounded-2xl transition-all flex items-center justify-center gap-3 text-xl"
              >
                <Copy className="w-6 h-6" />
                Kopiera föregående dag
              </button>
            )}

            {/* Next button - fill in new values */}
            <button
              onClick={handleSetupComplete}
              disabled={!entry.workTypeId || !entry.project}
              className="w-full py-8 px-8 bg-[#39ac63] hover:bg-[#2d8c4d] text-white rounded-3xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-3xl mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fyll i uppgifter
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Cancel button */}
            <button
              onClick={handleCancelFromSetup}
              className="w-full py-4 px-6 text-slate-500 hover:text-slate-300 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <ChevronLeft className="w-5 h-5" />
              Avbryt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular wizard steps
  const currentField = applicableFields[currentStep];

  if (!currentField) {
    return null;
  }

  const renderField = () => {
    const value = entry[currentField.id] || '';

    if (currentField.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => handleChange(currentField.id, e.target.value)}
          className="w-full px-8 py-8 text-center text-white bg-[#101318] border-4 border-white/20 rounded-3xl focus:outline-none focus:border-[#39ac63] transition-all min-h-64 resize-none text-2xl"
          autoFocus
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        />
      );
    }

    return (
      <input
        type={currentField.type}
        value={value}
        id={`${currentField.id}-input`}
        name={`${currentField.id}-input`}
        key={`${currentField.id}-input`}
        onChange={(e) => handleChange(currentField.id, e.target.value)}
        step={currentField.type === 'number' ? '0.5' : undefined}
        inputMode={currentField.type === 'number' ? 'decimal' : 'text'}
        className="w-full px-8 py-8 text-center text-white bg-[#101318] border-4 border-white/20 rounded-3xl focus:outline-none focus:border-[#39ac63] transition-all text-6xl"
        ref={inputRef as React.RefObject<HTMLInputElement>}
        autoFocus
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101318] to-[#1b1f27] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Date display */}
        <div className="text-center mb-6">
          <div className="text-slate-400">Registrerar för</div>
          <div className="text-white/90 text-xl">{formatDate(date)}</div>
          <div className="text-[#39ac63] mt-1">{entry.workTypeName} • {entry.project}</div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#39ac63] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 text-slate-300 text-center text-xl">
            Steg {currentStep + 1} av {totalSteps}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-[#1b1f27] rounded-3xl shadow-2xl p-8 sm:p-16 border border-white/10">
          {/* Current question */}
          <div className="mb-10">
            <label className="block text-center mb-8" ref={blurRef as React.RefObject<HTMLLabelElement>}>
              <span className="text-white text-3xl">{currentField.label}</span>
            </label>

            {renderField()}

            {/* Copy from previous day button */}
            {canCopyPrevious && (
              <button
                onClick={handleCopyPrevious}
                className="mt-6 w-full py-5 px-6 bg-white/10 hover:bg-white/20 text-slate-200 rounded-2xl transition-all flex items-center justify-center gap-3 text-xl"
              >
                <Copy className="w-6 h-6" />
                Kopiera från föregående dag
              </button>
            )}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full py-8 px-8 bg-[#39ac63] hover:bg-[#2d8c4d] text-white rounded-3xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-3xl mb-4"
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

          {/* Back button */}
          <button
            onClick={handleBack}
            className="w-full py-4 px-6 text-slate-500 hover:text-slate-300 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            {currentStep === 0 ? 'Ändra typ/projekt' : 'Tillbaka'}
          </button>
        </div>
      </div>
    </div>
  );
}