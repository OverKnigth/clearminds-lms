import { useState } from 'react';
import { mockTutorings } from '../utils/mockData';
import type { Tutoring } from '../models/types';
import Footer from '../components/Footer';

type Tab = 'pending' | 'upcoming' | 'completed' | 'students';

export default function Tutor() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [tutorings, setTutorings] = useState<Tutoring[]>(mockTutorings);
  const [selectedTutoring, setSelectedTutoring] = useState<Tutoring | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'confirm' | 'complete' | 'reschedule'>('confirm');

  const pendingTutorings = tutorings.filter(t => t.status === 'pending' || t.status === 'rescheduled');
  const upcomingTutorings = tutorings.filter(t => t.status === 'confirmed');
  const completedTutorings = tutorings.filter(t => t.status === 'completed');

  const openModal = (tutoring: Tutoring, type: typeof modalType) => {
    setSelectedTutoring(tutoring);
    setModalType(type);
    setShowModal(true);
  };

  const handleConfirm = (date: string, time: string, meetingLink: string) => {
    if (selectedTutoring) {
      setTutorings(tutorings.map(t => 
        t.id === selectedTutoring.id 
          ? { ...t, status: 'confirmed', scheduledDate: date, scheduledTime: time, meetingLink }
          : t
      ));
      setShowModal(false);
    }
  };

  const handleComplete = (grade: number, feedback: string, observations: string, recordingLink: string) => {
    if (selectedTutoring) {
      const approved = grade >= 7;
      setTutorings(tutorings.map(t => 
        t.id === selectedTutoring.id 
          ? { 
              ...t, 
              status: 'completed', 
              completedDate: new Date().toISOString(),
              grade,
              feedback,
              observations,
              recordingLink,
              approved
            }
          : t
      ));
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Panel del Tutor</h1>
          <p className="text-sm sm:text-base text-slate-400">Gestiona tutorías y valida el aprendizaje de los estudiantes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Pendientes</span>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{pendingTutorings.length}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Próximas</span>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{upcomingTutorings.length}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Completadas</span>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{completedTutorings.length}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Aprobación</span>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">100%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 sm:mb-8 border-b border-slate-700 overflow-x-auto">
          {[
            { id: 'pending', label: 'Pendientes', count: pendingTutorings.length },
            { id: 'upcoming', label: 'Próximas', count: upcomingTutorings.length },
            { id: 'completed', label: 'Completadas', count: completedTutorings.length },
            { id: 'students', label: 'Estudiantes', count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-all flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'pending' && (
            pendingTutorings.length > 0 ? (
              pendingTutorings.map(tutoring => (
                <TutoringCard 
                  key={tutoring.id} 
                  tutoring={tutoring} 
                  onAction={() => openModal(tutoring, 'confirm')}
                  actionLabel="Confirmar"
                  actionColor="red"
                />
              ))
            ) : (
              <EmptyState message="No hay tutorías pendientes" />
            )
          )}

          {activeTab === 'upcoming' && (
            upcomingTutorings.length > 0 ? (
              upcomingTutorings.map(tutoring => (
                <TutoringCard 
                  key={tutoring.id} 
                  tutoring={tutoring} 
                  onAction={() => openModal(tutoring, 'complete')}
                  actionLabel="Completar"
                  actionColor="green"
                />
              ))
            ) : (
              <EmptyState message="No hay tutorías próximas" />
            )
          )}

          {activeTab === 'completed' && (
            completedTutorings.length > 0 ? (
              completedTutorings.map(tutoring => (
                <TutoringCard 
                  key={tutoring.id} 
                  tutoring={tutoring} 
                  showDetails
                />
              ))
            ) : (
              <EmptyState message="No hay tutorías completadas" />
            )
          )}

          {activeTab === 'students' && (
            <EmptyState message="Vista de estudiantes en desarrollo" />
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedTutoring && (
        <TutoringModal
          tutoring={selectedTutoring}
          type={modalType}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          onComplete={handleComplete}
        />
      )}

      <Footer />
    </div>
  );
}

// Components
function TutoringCard({ 
  tutoring, 
  onAction, 
  actionLabel, 
  actionColor,
  showDetails 
}: { 
  tutoring: Tutoring;
  onAction?: () => void;
  actionLabel?: string;
  actionColor?: string;
  showDetails?: boolean;
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700 hover:border-slate-600 transition-all">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-sm sm:text-base font-semibold shadow-lg shadow-red-500/30 flex-shrink-0">
              {tutoring.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">{tutoring.studentName}</h3>
              <p className="text-xs sm:text-sm text-slate-400 truncate">{tutoring.courseName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Bloque</p>
              <p className="text-xs sm:text-sm text-white font-medium line-clamp-2">{tutoring.blockName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Solicitada</p>
              <p className="text-xs sm:text-sm text-white">{new Date(tutoring.requestDate).toLocaleDateString()}</p>
            </div>
            {tutoring.scheduledDate && (
              <>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Fecha</p>
                  <p className="text-xs sm:text-sm text-white">{new Date(tutoring.scheduledDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Hora</p>
                  <p className="text-xs sm:text-sm text-white">{tutoring.scheduledTime}</p>
                </div>
              </>
            )}
          </div>

          {showDetails && tutoring.grade !== undefined && (
            <div className="mt-4 p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-slate-400">Calificación</span>
                <span className={`text-base sm:text-lg font-bold ${tutoring.approved ? 'text-green-400' : 'text-red-400'}`}>
                  {tutoring.grade}/10
                </span>
              </div>
              {tutoring.feedback && (
                <p className="text-xs sm:text-sm text-slate-300 mb-2">{tutoring.feedback}</p>
              )}
              {tutoring.observations && (
                <p className="text-xs text-slate-400">{tutoring.observations}</p>
              )}
            </div>
          )}
        </div>

        {onAction && (
          <button
            onClick={onAction}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-${actionColor}-500 hover:bg-${actionColor}-400 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-slate-400">{message}</p>
    </div>
  );
}

function TutoringModal({
  tutoring,
  type,
  onClose,
  onConfirm,
  onComplete
}: {
  tutoring: Tutoring;
  type: 'confirm' | 'complete' | 'reschedule';
  onClose: () => void;
  onConfirm: (date: string, time: string, meetingLink: string) => void;
  onComplete: (grade: number, feedback: string, observations: string, recordingLink: string) => void;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [grade, setGrade] = useState(7);
  const [feedback, setFeedback] = useState('');
  const [observations, setObservations] = useState('');
  const [recordingLink, setRecordingLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'confirm') {
      onConfirm(date, time, meetingLink);
    } else if (type === 'complete') {
      onComplete(grade, feedback, observations, recordingLink);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {type === 'confirm' ? 'Confirmar Tutoría' : 'Completar Tutoría'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              <span className="font-semibold">{tutoring.studentName}</span> - {tutoring.blockName}
            </p>
          </div>

          {type === 'confirm' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hora</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Link de Reunión</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  required
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}

          {type === 'complete' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Calificación: {grade}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={grade}
                  onChange={(e) => setGrade(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0</span>
                  <span className={grade >= 7 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                    {grade >= 7 ? 'Aprobado' : 'No Aprobado'}
                  </span>
                  <span>10</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Retroalimentación</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  rows={3}
                  placeholder="Comentarios sobre el desempeño del estudiante..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Observaciones</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Link de Grabación</label>
                <input
                  type="url"
                  value={recordingLink}
                  onChange={(e) => setRecordingLink(e.target.value)}
                  placeholder="https://zoom.us/rec/..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm sm:text-base font-semibold rounded-lg transition-all"
            >
              {type === 'confirm' ? 'Confirmar Tutoría' : 'Guardar Resultados'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm sm:text-base rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
