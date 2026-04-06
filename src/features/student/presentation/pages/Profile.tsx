import { useStudentData } from '../hooks/useStudentData';
import { StudentBadges, StudentStats } from '../components';

export default function Profile() {
  const {
    userName,
    badges,
    courses,
    overallPct,
    isLoading
  } = useStudentData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Filter only earned badges for the profile
  const earnedBadges = badges.filter(b => b.state === 'earned');

  return (
    <div className="min-h-screen bg-slate-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-8">
        {/* Profile Header */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 mb-6 sm:mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-20">
             <svg className="w-48 h-48 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-tr from-red-600 to-orange-600 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-xl shadow-red-900/30">
              {userName.charAt(0)}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                 <h1 className="text-2xl font-black text-white uppercase tracking-tighter">{userName}</h1>
                 <span className="px-3 py-1 bg-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">Estudiante PRO</span>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">
                Potenciando habilidades en desarrollo de software
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-bold text-slate-300">Miembro desde Mar 2024</span>
                 </div>
                 {courses[0]?.group && (
                   <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2">
                     <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     <span className="text-sm font-bold text-slate-300">Grupo: <span className="text-purple-400">{(courses[0] as any).group.name}</span></span>
                   </div>
                 )}
                 <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 11-5.656 5.656l-1.102-1.101" /></svg>
                    <span className="text-sm font-bold text-slate-300">GitHub Conectado</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
           <div className="lg:col-span-1 space-y-8">
              <StudentStats 
                coursesCount={courses.length}
                overallPct={overallPct}
                badgesCount={earnedBadges.length}
                tutoringsCount={0}
              />
              
              <div className="bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700/50">
                 <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-[10px] opacity-50">Configuración</h3>
                 <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-2xl hover:bg-slate-700/50 transition-colors">
                       <span className="text-sm font-bold text-slate-300">Editar Perfil</span>
                       <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-2xl hover:bg-slate-700/50 transition-colors">
                       <span className="text-sm font-bold text-slate-300">Notificaciones</span>
                       <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="lg:col-span-2 space-y-8">
              <StudentBadges badges={earnedBadges} />
              
              <div className="bg-slate-800/80 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                 <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Mi Camino</h2>
                 <div className="space-y-6">
                    {courses.map(course => (
                       <div key={course.id} className="relative group">
                          <div className="flex items-center justify-between mb-2 px-2">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-sm font-black text-white uppercase tracking-widest">{course.name}</span>
                             </div>
                             <span className="text-xs font-bold text-red-500">{course.progress?.pct || 0}%</span>
                          </div>
                          <div className="h-3 bg-slate-900 rounded-full overflow-hidden shadow-inner flex items-center px-0.5">
                             <div 
                               className="h-1.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                               style={{ width: `${course.progress?.pct || 0}%` }}
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
