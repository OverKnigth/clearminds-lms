import { useState } from 'react';
import type { Challenge, ChallengeSubmission } from '../models/types';

interface ChallengeSubmissionProps {
  challenge: Challenge;
  onSubmit: (submission: Partial<ChallengeSubmission>) => void;
}

export default function ChallengeSubmission({ challenge, onSubmit }: ChallengeSubmissionProps) {
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [githubLink, setGithubLink] = useState('');
  const [notes, setNotes] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const submission = challenge.submission;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    
    // Simulate upload - in production, upload to your server/cloud storage
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEvidenceUrls(prev => [...prev, base64String]);
      };
      
      reader.readAsDataURL(file);
    }
    
    setUploadingImage(false);
    e.target.value = ''; // Reset input
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      evidenceUrls,
      githubLink: challenge.requiresGithubLink ? githubLink : undefined,
      notes,
      status: 'scheduled',
      tutorMeeting: challenge.requiresTutorReview ? {
        id: `meeting-${Date.now()}`,
        scheduledDate: meetingDate,
        scheduledTime: meetingTime,
        status: 'scheduled',
      } : undefined,
      submittedAt: new Date().toISOString(),
    });
  };

  // Mostrar estado de entrega si existe
  if (submission) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-700">
          <div className="flex items-start gap-3 mb-4 sm:mb-6">
            {submission.status === 'approved' && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {submission.status === 'needs_correction' && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
            {(submission.status === 'pending' || submission.status === 'scheduled') && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {submission.status === 'reviewed' && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {submission.status === 'approved' && 'Reto Aprobado'}
                {submission.status === 'needs_correction' && 'Requiere Correcciones'}
                {submission.status === 'pending' && 'Entrega Pendiente de Revisión'}
                {submission.status === 'scheduled' && 'Reunión Agendada'}
                {submission.status === 'reviewed' && 'Revisado por el Tutor'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Enviado el {new Date(submission.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {submission.grade !== undefined && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm sm:text-base text-slate-300">Calificación:</span>
                <span className={`text-xl sm:text-2xl font-bold ${
                  submission.grade >= 70 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {submission.grade}/100
                </span>
              </div>
              {submission.feedback && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-xs sm:text-sm text-slate-400 mb-1">Retroalimentación del tutor:</p>
                  <p className="text-sm sm:text-base text-slate-300">{submission.feedback}</p>
                </div>
              )}
            </div>
          )}

          {submission.tutorMeeting && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h4 className="text-sm sm:text-base font-semibold text-white">Reunión con Tutor</h4>
              </div>
              <p className="text-sm sm:text-base text-slate-300">
                {submission.tutorMeeting.scheduledDate} a las {submission.tutorMeeting.scheduledTime}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Estado: {submission.tutorMeeting.status === 'scheduled' ? 'Agendada' : 
                         submission.tutorMeeting.status === 'completed' ? 'Completada' : 'Cancelada'}
              </p>
            </div>
          )}

          {/* Mostrar evidencias enviadas */}
          {submission.evidenceUrls && submission.evidenceUrls.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3">Evidencias Enviadas:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {submission.evidenceUrls.map((url, index) => (
                  <img 
                    key={index}
                    src={url} 
                    alt={`Evidencia ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-slate-700"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mostrar link de GitHub enviado */}
          {submission.githubLink && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-400 mb-2">Repositorio GitHub:</p>
              <a 
                href={submission.githubLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 flex items-start gap-2 break-all"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-xs sm:text-sm">{submission.githubLink}</span>
              </a>
            </div>
          )}

          {/* Mostrar notas enviadas */}
          {submission.notes && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-400 mb-2">Notas adicionales:</p>
              <p className="text-sm sm:text-base text-slate-300">{submission.notes}</p>
            </div>
          )}

          {submission.status === 'needs_correction' && (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm sm:text-base font-semibold rounded-xl transition-all"
            >
              Enviar Correcciones
            </button>
          )}
        </div>
      </div>
    );
  }

  // Formulario de entrega
  return (
    <div className="bg-slate-800 rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-700">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-white">Entrega del Reto</h3>
            <p className="text-xs sm:text-sm text-slate-400">Completa el formulario para enviar tu trabajo</p>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg mb-4 sm:mb-6">
          <h4 className="text-sm sm:text-base font-semibold text-white mb-2">Instrucciones:</h4>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{challenge.instructions}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {challenge.requiresEvidence && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Evidencia (Capturas de pantalla, imágenes)
            </label>
            <div className="space-y-3">
              {evidenceUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Evidencia ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(index)}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <div className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/50 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-red-500 rounded-xl cursor-pointer transition-all">
                  {uploadingImage ? (
                    <>
                      <svg className="w-6 h-6 text-red-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-slate-400">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-slate-300 font-medium">Haz clic para subir imágenes</span>
                      <span className="text-slate-500 text-sm">o arrastra y suelta</span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {challenge.requiresGithubLink && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Repositorio de GitHub
            </label>
            <input
              type="url"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              required
              placeholder="https://github.com/usuario/repositorio"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Agrega cualquier comentario o nota sobre tu entrega..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>

        {challenge.requiresTutorReview && (
          <div className="p-4 sm:p-6 bg-slate-700/30 border border-slate-600 rounded-xl">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar Reunión de Calificación
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hora
                </label>
                <select
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Seleccionar hora</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50"
        >
          Enviar Reto
        </button>
      </form>
    </div>
  );
}
