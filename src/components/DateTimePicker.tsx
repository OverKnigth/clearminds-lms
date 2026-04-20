import { useState, useEffect, useRef } from 'react';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  label?: string;
  disabledSlots?: string[];
}

// Move helper outside to be stable
const safeParseDate = (val: string | undefined | null): Date => {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

export default function DateTimePicker({ value, onChange, minDate, label, disabledSlots }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [_view, setView] = useState<'date' | 'time'>('date');
  const [timeStep, setTimeStep] = useState<'hour' | 'minute'>('hour');
  const containerRef = useRef<HTMLDivElement>(null);

  // internalSelectedDate tracks where the user is currently looking/editing
  const [internalDate, setInternalDate] = useState(() => safeParseDate(value));

  // Calendar view state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = safeParseDate(value);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Sync internal state when value prop changes, but ONLY if it's different to avoid loops
  useEffect(() => {
    const d = safeParseDate(value);
    // Use getTime comparison to avoid unnecessary updates
    if (d.getTime() !== internalDate.getTime()) {
      setInternalDate(d);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    try {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return '---'; }
  };

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch { return '--:--'; }
  };

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(internalDate);
    newDate.setFullYear(date.getFullYear());
    newDate.setMonth(date.getMonth());
    newDate.setDate(date.getDate());
    setInternalDate(newDate);
    setView('time');
    setTimeStep('hour');
  };

  const handleHourSelect = (hour: number) => {
    const newDate = new Date(internalDate);
    newDate.setHours(hour);
    setInternalDate(newDate);
    setTimeStep('minute');
  };

  const handleTimeComplete = (minute: number) => {
    const newDate = new Date(internalDate);
    newDate.setMinutes(minute);
    setInternalDate(newDate);
    
    const localISO = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    onChange(localISO);
    setIsOpen(false);
  };

  const isOccupiedAt = (hour: number, minute: number) => {
    if (!disabledSlots || disabledSlots.length === 0 || isNaN(internalDate.getTime())) return false;
    
    return disabledSlots.some(slot => {
      try {
        // The API returns local times with a trailing 'Z' which is incorrect.
        // Strip the timezone marker so JS parses as LOCAL time instead of UTC.
        const localSlot = slot.endsWith('Z') ? slot.slice(0, -1) : slot;
        const d = new Date(localSlot);
        if (isNaN(d.getTime())) return false;
        
        let slotYear = d.getFullYear();
        let slotMonth = d.getMonth();
        let slotDay = d.getDate();
        let slotHour = d.getHours();
        const slotMinutes = d.getMinutes();

        // 15-minute threshold normalization:
        // 00-15 min  → block the :00 slot of that hour
        // 16-45 min  → block the :30 slot of that hour
        // 46-59 min  → block the :00 slot of the NEXT hour
        let normalizedSlotMinute: number;
        if (slotMinutes <= 15) {
          normalizedSlotMinute = 0;
        } else if (slotMinutes <= 45) {
          normalizedSlotMinute = 30;
        } else {
          normalizedSlotMinute = 0;
          slotHour += 1;
          // Handle hour overflow (23 → 0 next day)
          if (slotHour >= 24) {
            slotHour = 0;
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            slotYear = next.getFullYear();
            slotMonth = next.getMonth();
            slotDay = next.getDate();
          }
        }

        const sameDay = (
          slotYear === internalDate.getFullYear() &&
          slotMonth === internalDate.getMonth() &&
          slotDay === internalDate.getDate()
        );

        if (!sameDay) return false;

        return slotHour === hour && normalizedSlotMinute === minute;
      } catch { return false; }
    });
  };

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const renderCalendar = () => {
    const totalDays = daysInMonth(calendarMonth);
    const startDay = firstDayOfMonth(calendarMonth);
    const days = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
    const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));

    for (let i = 0; i < (startDay === 0 ? 0 : startDay); i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d);
      const isSelected = internalDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();
      const isDisabled = minDate ? date < new Date(new Date(minDate).setHours(0,0,0,0)) : false;

      days.push(
        <button
          key={d}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDateSelect(date)}
          className={`h-9 w-9 flex items-center justify-center rounded-xl text-[11px] transition-all
            ${isSelected ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-900/40' : 
              isDisabled ? 'text-slate-600 cursor-not-allowed opacity-30' : 
              'text-slate-300 hover:bg-slate-700/50 hover:text-white'}
            ${isToday && !isSelected ? 'border border-red-500/30 text-red-400' : ''}
          `}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="p-3 w-[250px]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-bold text-[10px] uppercase tracking-widest px-1">
            {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
          </h4>
          <div className="flex gap-1">
            <button type="button" onClick={prevMonth} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <button type="button" onClick={nextMonth} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dayNames.map(day => <div key={day} className="h-6 flex items-center justify-center text-[7px] font-black text-slate-600 uppercase">{day}</div>)}
          {days.map((day, i) => (
            <div key={i} className="h-8 w-8 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimePicker = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 10);
    const minutes = [0, 30];

    return (
      <div className={`p-4 w-[240px] border-l border-slate-700/50 bg-slate-900/20`}>
        {timeStep === 'hour' ? (
          <>
            <div className="flex items-center justify-center mb-3">
               <h4 className="text-white font-bold text-[9px] uppercase tracking-widest text-center">Seleccionar Hora</h4>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {hours.map(h => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const displayHour = h % 12 || 12;
                const isSelected = internalDate.getHours() === h;
                const isToday = internalDate.toDateString() === new Date().toDateString();
                // Only disable hours STRICTLY in the past (not the current hour)
                // Current hour may still have :30 available
                const isDisabled = isToday && h < new Date().getHours();
                // Hour is "full" if BOTH :00 and :30 are taken → disable entirely
                const hourIsFull = [0, 30].every(m => isOccupiedAt(h, m));
                // Hour is "partial" if AT LEAST ONE slot is taken → warn but allow
                const hourHasAny = !hourIsFull && [0, 30].some(m => isOccupiedAt(h, m));

                return (
                  <button
                    key={h}
                    type="button"
                    disabled={isDisabled || hourIsFull}
                    onClick={() => handleHourSelect(h)}
                    className={`h-9 rounded-lg text-[10px] font-black transition-all relative
                      ${isSelected ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 
                        (isDisabled || hourIsFull) ? 'text-slate-600 cursor-not-allowed opacity-30 bg-slate-900/10' : 
                        hourHasAny ? 'bg-orange-500/10 text-orange-300 border border-orange-500/30 hover:bg-orange-500/20' :
                        'bg-slate-700/50 text-white hover:bg-slate-700 hover:text-red-400 border border-transparent hover:border-red-500/30'}
                    `}
                  >
                    {displayHour} <span className="text-[7px] opacity-60">{ampm}</span>
                    {(hourIsFull || hourHasAny) && !isDisabled && (
                      <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${hourIsFull ? 'bg-slate-500' : 'bg-orange-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
               <button type="button" onClick={() => setTimeStep('hour')} className="text-slate-400 hover:text-white transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
               <div className="text-center">
                 <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">
                    {internalDate.getHours() % 12 || 12}:XX {internalDate.getHours() >= 12 ? 'PM' : 'AM'}
                 </p>
               </div>
               <div className="w-4" />
            </div>
            <div className="flex-1 flex flex-col gap-2 justify-center">
              {minutes.map(m => {
                const isSelected = internalDate.getMinutes() === m;
                const isToday = internalDate.toDateString() === new Date().toDateString();
                const now = new Date();
                // Disable if in the past (current hour only, check specific minute)
                const isDisabled = internalDate.toDateString() === now.toDateString() &&
                  internalDate.getHours() === now.getHours() &&
                  m <= now.getMinutes();
                const slotIsOccupied = isOccupiedAt(internalDate.getHours(), m);

                return (
                  <button
                    key={m}
                    type="button"
                    disabled={isDisabled || slotIsOccupied}
                    onClick={() => handleTimeComplete(m)}
                    className={`py-6 rounded-2xl text-2xl font-black transition-all flex flex-col items-center justify-center
                      ${isSelected ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 
                        (isDisabled || slotIsOccupied) ? 'text-slate-600 cursor-not-allowed opacity-30' : 
                        'bg-slate-800 text-white hover:bg-slate-700 hover:text-red-400 border border-transparent hover:border-red-500/20'}
                    `}
                  >
                    <span className="leading-none">:{m.toString().padStart(2, '0')}</span>
                    {slotIsOccupied && <span className="text-[8px] uppercase tracking-widest mt-1 opacity-40 font-black">Ocupado</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setView('date'); }}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all hover:bg-slate-700 group shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors border border-red-500/10">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-black text-white">{formatDate(internalDate)}</p>
            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">{formatTime(internalDate)}</p>
          </div>
        </div>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[100] bg-slate-900/90 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl shadow-black overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex divide-x divide-slate-700/50">
            {renderCalendar()}
            {renderTimePicker()}
          </div>
          
          <div className="p-2.5 bg-black/40 border-t border-slate-700/50 flex items-center justify-between gap-3">
             <div className="px-2">
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Selección:</p>
               <p className="text-[10px] text-white font-black truncate">{formatDate(internalDate)} @ {formatTime(internalDate)}</p>
             </div>
             <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-red-500/20">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
