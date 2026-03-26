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

  // Si ya hay una entrega, mostrar el estado
  if (submission) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          {submission.status === 'approved' && (
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {submission.status === 'needs_correction' && (
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          {(submission.status === 'pending' || submission.status === 'scheduled') && (
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          {submission.status === 'reviewed' && (
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-white">
              {submission.status === 'approved' && 'Reto Aprobado'}
              {submission.status === 'needs_correction' && 'Requiere Correcciones'}
              {submission.status === 'pending' && 'Entrega Pendiente de Revisión'}
              {submission.status === 'scheduled' && 'Reunión Agendada'}
              {submission.status === 'reviewed' && 'Revisado por el Tutor'}
            </h3>
            <p className="text-sm text-slate-400">
              Enviado el {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {submission.grade !== undefined && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Calificación:</span>
              <span className={`text-2xl font-bold ${
                submission.grade >= 70 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {submission.grade}/100
              </span>
            </div>
            {submission.feedback && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <p className="text-sm text-slate-400 mb-1">Retroalimentación del tutor:</p>
                <p className="text-slate-300">{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        {submission.tutorMeeting && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 className="font-semibold text-white">Reunión con Tutor</h4>
            </div>
            <p className="text-slate-300 text-sm">
              {submission.tutorMeeting.scheduledDate} a las {submission.tutorMeeting.scheduledTime}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Estado: {submission.tutorMeeting.status === 'scheduled' ? 'Agendada' : 
                       submission.tutorMeeting.status === 'completed' ? 'Completada' : 'Cancelada'}
            </p>
          </div>
        )}

        {submission.status === 'needs_correction' && (
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all"
          >
            Enviar Correcciones
          </button>
        )}
      </div>
    );
  }

  // Formulario de entrega
  return (
    <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Entrega del Reto</h3>
            <p className="text-sm text-slate-400">Completa el formulario para enviar tu trabajo</p>
          </div>
        </div>

        <div className="p-4 bg-slate-700/50 rounded-lg mb-6">
          <h4 className="font-semibold text-white mb-2">Instrucciones:</h4>
          <p className="text-slate-300 text-sm leading-relaxed">{challenge.instructions}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/50 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-cyan-500 rounded-xl cursor-pointer transition-all">
                  {uploadingImage ? (
                    <>
                      <svg className="w-6 h-6 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-slate-400">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          />
        </div>

        {challenge.requiresTutorReview && (
          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar Reunión de Calificación
            </h4>
            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/50"
        >
          Enviar Reto
        </button>
      </form>
    </div>
  );
}
