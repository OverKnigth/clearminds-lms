import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTutorings, mockCourses, mockUser } from '../utils/mockData';
import Footer from '../components/Footer';

export default function Meetings() {
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Filter tutorings for current student
  const myTutorings = mockTutorings.filter(t => t.studentId === mockUser.id);
  const pendingTutorings = myTutorings.filter(t => t.status === 'pending' || t.status === 'rescheduled');
  const scheduledTutorings = myTutorings.filter(t => t.status === 'confirmed');
  const completedTutorings = myTutorings.filter(t => t.status === 'completed');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'yellow', label: 'Pendiente', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      rescheduled: { color: 'orange', label: 'Reagendada', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      confirmed: { color: 'blue', label: 'Confirmada', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      completed: { color: 'green', label: 'Completada', icon: 'M5 13l4 4L19 7' },
      cancelled: { color: 'red', label: 'Cancelada', icon: 'M6 18L18 6M6 6l12 12' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${config.color}-500/20 text-${config.color}-400 text-xs font-semibold rounded-full`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
        </svg>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Mis Tutorías</h1>
                <p className="text-slate-400">Gestiona tus sesiones de validación con tutores</p>
              </div>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Solicitar Tutoría
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <span className="text-slate-400 text-sm">Confirmadas</span>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{scheduledTutorings.length}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Completadas</span>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{completedTutorings.length}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Promedio</span>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">9.0</p>
          </div>
        </div>

        {/* Pending Tutorings */}
        {pendingTutorings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">Pendientes de Confirmar</h2>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-semibold rounded-full">
                {pendingTutorings.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingTutorings.map((tutoring) => (
                <TutoringCard key={tutoring.id} tutoring={tutoring} getStatusBadge={getStatusBadge} />
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Tutorings */}
        {scheduledTutorings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">Próximas Tutorías</h2>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full">
                {scheduledTutorings.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scheduledTutorings.map((tutoring) => (
                <TutoringCard key={tutoring.id} tutoring={tutoring} getStatusBadge={getStatusBadge} showJoinButton />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tutorings */}
        {completedTutorings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">Tutorías Completadas</h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">
                {completedTutorings.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedTutorings.map((tutoring) => (
                <TutoringCard key={tutoring.id} tutoring={tutoring} getStatusBadge={getStatusBadge} showResults />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {myTutorings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tienes tutorías</h3>
            <p className="text-slate-400 mb-6">Completa los bloques de tus cursos para solicitar tutorías de validación</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all"
            >
              Ver Mis Cursos
            </button>
          </div>
        )}
      </div>

      {/* Request Tutoring Modal */}
      {showRequestModal && (
        <RequestTutoringModal onClose={() => setShowRequestModal(false)} />
      )}

      <Footer />
    </div>
  );
}

// Components
function TutoringCard({ 
  tutoring, 
  getStatusBadge, 
  showJoinButton, 
  showResults 
}: { 
  tutoring: any;
  getStatusBadge: (status: string) => JSX.Element;
  showJoinButton?: boolean;
  showResults?: boolean;
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{tutoring.blockName}</h3>
          <p className="text-sm text-slate-400 mb-3">{tutoring.courseName}</p>
          {getStatusBadge(tutoring.status)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {tutoring.tutorName && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {tutoring.tutorName}
          </div>
        )}
        {tutoring.scheduledDate && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(tutoring.scheduledDate).toLocaleDateString()} - {tutoring.scheduledTime}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Solicitada: {new Date(tutoring.requestDate).toLocaleDateString()}
        </div>
      </div>

      {showResults && tutoring.grade !== undefined && (
        <div className="mb-4 p-4 bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Calificación:</span>
            <span className={`text-2xl font-bold ${tutoring.approved ? 'text-green-400' : 'text-red-400'}`}>
              {tutoring.grade}/10
            </span>
          </div>
          {tutoring.feedback && (
            <div className="mt-3 pt-3 border-t border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Retroalimentación:</p>
              <p className="text-sm text-slate-300">{tutoring.feedback}</p>
            </div>
          )}
          {tutoring.recordingLink && (
            <a
              href={tutoring.recordingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Ver grabación
            </a>
          )}
        </div>
      )}

      {showJoinButton && tutoring.meetingLink && (
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <a
            href={tutoring.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all text-center"
          >
            Unirse a la Reunión
          </a>
        </div>
      )}
    </div>
  );
}

function RequestTutoringModal({ onClose }: { onClose: () => void }) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [observations, setObservations] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Solicitud de tutoría enviada exitosamente');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
          <h2 className="text-xl font-bold text-white">Solicitar Tutoría</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Curso</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Selecciona un curso</option>
              {mockCourses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bloque</label>
              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Selecciona un bloque</option>
                {mockCourses.find(c => c.id === selectedCourse)?.blocks.map(block => (
                  <option key={block.id} value={block.id}>{block.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Observaciones (opcional)</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              placeholder="Agrega cualquier comentario o pregunta para el tutor..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
            >
              Enviar Solicitud
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
