import { useState } from 'react';
import Modal from '../components/Modal';
import Footer from '../components/Footer';

type Tab = 'students' | 'courses' | 'progress' | 'assignments';

interface Student {
  id: string;
  fullName: string;
  email: string;
  enrollmentDate: string;
  generation: string;
  assignedCourses: string[];
  progress: number;
  status: 'active' | 'inactive';
}

interface CourseData {
  id: string;
  title: string;
  category: string;
  modules: number;
  videos: number;
  students: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  generation: string;
  selectedCourses: string[];
}

interface ContentFormData {
  type: 'video' | 'challenge' | 'module';
  title: string;
  description: string;
  duration: string;
  url: string;
  order: number;
  requiresEvidence: boolean;
  requiresGithubLink: boolean;
  requiresTutorReview: boolean;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'addStudent' | 'editStudent' | 'addCourse' | 'editCourse' | 'assignCourse' | 'resetPassword' | 'editCourseContent'>('addStudent');
  const [contentModalType, setContentModalType] = useState<'addModule' | 'editModule' | 'addContent' | 'editContent'>('addContent');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    generation: 'Gen 2026-A',
    selectedCourses: [],
  });
  const [contentFormData, setContentFormData] = useState<ContentFormData>({
    type: 'video',
    title: '',
    description: '',
    duration: '',
    url: '',
    order: 1,
    requiresEvidence: false,
    requiresGithubLink: false,
    requiresTutorReview: false,
  });
  
  // Filters
  const [assignmentFilter, setAssignmentFilter] = useState({ name: '', generation: 'all' });
  const [progressFilter, setProgressFilter] = useState({ name: '', generation: 'all', course: 'all' });

  // Mock data - replace with real data from backend
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      fullName: 'María González Pérez',
      email: 'maria.gonzalez@email.com',
      enrollmentDate: '2026-01-10',
      generation: 'Gen 2026-A',
      assignedCourses: ['1', '2'],
      progress: 65,
      status: 'active',
    },
    {
      id: '2',
      fullName: 'Carlos Ramírez López',
      email: 'carlos.ramirez@email.com',
      enrollmentDate: '2026-01-10',
      generation: 'Gen 2026-A',
      assignedCourses: ['1', '3'],
      progress: 45,
      status: 'active',
    },
  ]);

  const [courses] = useState<CourseData[]>([
    { id: '1', title: 'Desarrollo Web Full Stack', modules: 5, videos: 24, students: 45, category: 'DESARROLLO' },
    { id: '2', title: 'Certificación AWS Cloud', modules: 3, videos: 18, students: 32, category: 'CLOUD' },
    { id: '3', title: 'Python para Data Science', modules: 4, videos: 20, students: 28, category: 'DATA' },
  ]);

  const openModal = (type: typeof modalType, student?: Student, course?: CourseData) => {
    setModalType(type);
    setSelectedStudent(student || null);
    setSelectedCourse(course || null);
    
    // Pre-fill form data when editing
    if (type === 'editStudent' && student) {
      const [firstName, ...lastNameParts] = student.fullName.split(' ');
      setFormData({
        firstName,
        lastName: lastNameParts.join(' '),
        email: student.email,
        password: '',
        generation: student.generation,
        selectedCourses: student.assignedCourses,
      });
    } else if (type === 'assignCourse' && student) {
      setFormData({
        ...formData,
        selectedCourses: student.assignedCourses,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        generation: 'Gen 2026-A',
        selectedCourses: [],
      });
    }
    
    setIsModalOpen(true);
  };

  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalType === 'addStudent') {
      const newStudent: Student = {
        id: String(students.length + 1),
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        enrollmentDate: new Date().toISOString().split('T')[0],
        generation: formData.generation,
        assignedCourses: [],
        progress: 0,
        status: 'active',
      };
      setStudents([...students, newStudent]);
    } else if (modalType === 'editStudent' && selectedStudent) {
      setStudents(students.map(s => 
        s.id === selectedStudent.id 
          ? { ...s, fullName: `${formData.firstName} ${formData.lastName}`, email: formData.email, generation: formData.generation }
          : s
      ));
    }
    
    setIsModalOpen(false);
  };

  const handleAssignCourses = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      setStudents(students.map(s => 
        s.id === selectedStudent.id 
          ? { ...s, assignedCourses: formData.selectedCourses }
          : s
      ));
    }
    setIsModalOpen(false);
  };

  const toggleCourseSelection = (courseId: string) => {
    setFormData({
      ...formData,
      selectedCourses: formData.selectedCourses.includes(courseId)
        ? formData.selectedCourses.filter(id => id !== courseId)
        : [...formData.selectedCourses, courseId],
    });
  };

  const toggleCourseForStudent = (studentId: string, courseId: string) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const assignedCourses = s.assignedCourses.includes(courseId)
          ? s.assignedCourses.filter(id => id !== courseId)
          : [...s.assignedCourses, courseId];
        return { ...s, assignedCourses };
      }
      return s;
    }));
  };

  // Filter functions
  const filteredStudentsForAssignments = students.filter(student => {
    const matchesName = student.fullName.toLowerCase().includes(assignmentFilter.name.toLowerCase());
    const matchesGeneration = assignmentFilter.generation === 'all' || student.generation === assignmentFilter.generation;
    return matchesName && matchesGeneration;
  });

  const filteredStudentsForProgress = students.filter(student => {
    const matchesName = student.fullName.toLowerCase().includes(progressFilter.name.toLowerCase());
    const matchesGeneration = progressFilter.generation === 'all' || student.generation === progressFilter.generation;
    return matchesName && matchesGeneration;
  });

  const openContentModal = (type: typeof contentModalType, moduleId?: string) => {
    setContentModalType(type);
    setSelectedModuleId(moduleId || null);
    
    if (type === 'addContent' || type === 'addModule') {
      setContentFormData({
        type: 'video',
        title: '',
        description: '',
        duration: '',
        url: '',
        order: 1,
        requiresEvidence: false,
        requiresGithubLink: false,
        requiresTutorReview: false,
      });
    }
    
    setIsContentModalOpen(true);
  };

  const handleSubmitContent = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se guardaría el contenido en el backend
    console.log('Guardando contenido:', contentFormData);
    setIsContentModalOpen(false);
  };

  const getContentModalTitle = () => {
    switch (contentModalType) {
      case 'addModule': return 'Agregar Nuevo Módulo';
      case 'editModule': return 'Editar Módulo';
      case 'addContent': return 'Agregar Video o Reto';
      case 'editContent': return contentFormData.type === 'video' ? 'Editar Video' : 'Editar Reto';
      default: return '';
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'addStudent': return 'Agregar Nuevo Estudiante';
      case 'editStudent': return 'Editar Estudiante';
      case 'addCourse': return 'Crear Nuevo Curso';
      case 'editCourse': return 'Editar Curso';
      case 'editCourseContent': return 'Gestionar Contenido del Curso';
      case 'assignCourse': return 'Asignar Cursos';
      case 'resetPassword': return 'Restablecer Contraseña';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
              <p className="text-slate-400">Gestiona estudiantes, cursos y seguimiento de progreso</p>
            </div>
            <button
              onClick={() => window.location.href = '/admin/reports'}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Reportes
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          {[
            { id: 'students', label: 'Estudiantes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'courses', label: 'Cursos', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { id: 'progress', label: 'Progreso', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'assignments', label: 'Asignaciones', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Gestión de Estudiantes</h2>
                <p className="text-sm text-slate-400">Administra usuarios, credenciales y asignaciones</p>
              </div>
              <button
                onClick={() => openModal('addStudent')}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Estudiante
              </button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estudiante</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Correo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Generación</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Cursos</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Progreso</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-semibold">
                            {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{student.fullName}</p>
                            <p className="text-xs text-slate-400">ID: {student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{student.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded">
                          {student.generation}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{student.assignedCourses.length} cursos</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden w-20">
                            <div 
                              className="h-full bg-gradient-to-r from-red-600 to-red-700"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          student.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {student.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openModal('editStudent', student)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => openModal('assignCourse', student)}
                            className="text-red-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Asignar
                          </button>
                          <button 
                            onClick={() => openModal('resetPassword', student)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Gestión de Cursos</h2>
                <p className="text-sm text-slate-400">Administra contenido, módulos y videos</p>
              </div>
              <button
                onClick={() => openModal('addCourse')}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Curso
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-red-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full">
                      {course.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-4">{course.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Módulos:</span>
                      <span className="text-white font-medium">{course.modules}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Videos:</span>
                      <span className="text-white font-medium">{course.videos}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Estudiantes:</span>
                      <span className="text-white font-medium">{course.students}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-slate-700">
                    <button 
                      onClick={() => openModal('editCourse', undefined, course)}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Editar Info
                    </button>
                    <button 
                      onClick={() => openModal('editCourseContent', undefined, course)}
                      className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Contenido
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Seguimiento de Progreso</h2>
              <p className="text-sm text-slate-400">Monitorea el avance por generación y módulo</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={progressFilter.name}
                  onChange={(e) => setProgressFilter({ ...progressFilter, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select 
                value={progressFilter.generation}
                onChange={(e) => setProgressFilter({ ...progressFilter, generation: e.target.value })}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todas las Generaciones</option>
                <option value="Gen 2026-A">Gen 2026-A</option>
                <option value="Gen 2026-B">Gen 2026-B</option>
                <option value="Gen 2025-B">Gen 2025-B</option>
              </select>
              <select 
                value={progressFilter.course}
                onChange={(e) => setProgressFilter({ ...progressFilter, course: e.target.value })}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todos los Cursos</option>
                <option value="1">Desarrollo Web Full Stack</option>
                <option value="2">AWS Cloud</option>
                <option value="3">Python para Data Science</option>
              </select>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Promedio General', value: '68%', color: 'red' },
                { label: 'Estudiantes Activos', value: '45', color: 'green' },
                { label: 'Cursos Completados', value: '12', color: 'purple' },
                { label: 'Retos Pendientes', value: '8', color: 'yellow' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Detailed Progress Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Estudiante</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Curso</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Módulo Actual</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Progreso</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Última Actividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredStudentsForProgress.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-white">{student.fullName}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">Desarrollo Web Full Stack</td>
                      <td className="px-6 py-4 text-sm text-slate-400">Módulo 3: React y TypeScript</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden w-32">
                            <div 
                              className="h-full bg-gradient-to-r from-red-600 to-red-700"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">Hace 2 horas</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Asignación de Cursos</h2>
              <p className="text-sm text-slate-400">Habilita o deshabilita cursos para cada estudiante</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar estudiante por nombre..."
                  value={assignmentFilter.name}
                  onChange={(e) => setAssignmentFilter({ ...assignmentFilter, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select 
                value={assignmentFilter.generation}
                onChange={(e) => setAssignmentFilter({ ...assignmentFilter, generation: e.target.value })}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todas las Generaciones</option>
                <option value="Gen 2026-A">Gen 2026-A</option>
                <option value="Gen 2026-B">Gen 2026-B</option>
                <option value="Gen 2025-B">Gen 2025-B</option>
              </select>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider sticky left-0 bg-slate-700/50 z-10">Estudiante</th>
                      {courses.map(course => (
                        <th key={course.id} className="px-4 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider min-w-[180px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-center">{course.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal normal-case">{course.category}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredStudentsForAssignments.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 sticky left-0 bg-slate-800 z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white whitespace-nowrap">{student.fullName}</p>
                              <p className="text-xs text-slate-400">{student.generation}</p>
                            </div>
                          </div>
                        </td>
                        {courses.map(course => (
                          <td key={course.id} className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleCourseForStudent(student.id, course.id)}
                              className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center mx-auto ${
                                student.assignedCourses.includes(course.id)
                                  ? 'bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30'
                                  : 'bg-slate-700 border-2 border-slate-600 hover:bg-slate-600'
                              }`}
                            >
                              {student.assignedCourses.includes(course.id) ? (
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 text-sm font-semibold bg-red-500/20 text-red-400 rounded-full">
                            {student.assignedCourses.length}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-slate-300 font-medium mb-1">Instrucciones</p>
                  <p className="text-sm text-slate-400">
                    Haz clic en los botones para habilitar (✓) o deshabilitar (✗) cursos para cada estudiante. 
                    Los cambios se aplican inmediatamente y el estudiante verá los cursos actualizados en su dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={getModalTitle()}>
        {/* Add Student Form */}
        {modalType === 'addStudent' && (
          <form onSubmit={handleSubmitStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombres</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Apellidos</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Pérez López"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="estudiante@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña Inicial</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Generación</label>
              <select 
                value={formData.generation}
                onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>Gen 2026-A</option>
                <option>Gen 2026-B</option>
                <option>Gen 2025-B</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Crear Estudiante
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Edit Student Form */}
        {modalType === 'editStudent' && selectedStudent && (
          <form onSubmit={handleSubmitStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombres</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Apellidos</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Generación</label>
              <select 
                value={formData.generation}
                onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>Gen 2026-A</option>
                <option>Gen 2026-B</option>
                <option>Gen 2025-B</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Assign Courses Form */}
        {modalType === 'assignCourse' && selectedStudent && (
          <form onSubmit={handleAssignCourses} className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
              <p className="text-red-400 text-sm">
                Asignando cursos a <span className="font-semibold">{selectedStudent.fullName}</span>
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300 mb-3">Selecciona los cursos</label>
              {courses.map(course => (
                <label key={course.id} className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.selectedCourses.includes(course.id)}
                    onChange={() => toggleCourseSelection(course.id)}
                    className="w-5 h-5 rounded border-slate-500 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{course.title}</p>
                    <p className="text-sm text-slate-400">{course.category} • {course.modules} módulos • {course.videos} videos</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Asignar Cursos ({formData.selectedCourses.length})
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Form */}
        {modalType === 'resetPassword' && selectedStudent && (
          <form className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
              <p className="text-yellow-400 text-sm">
                Vas a restablecer la contraseña de <span className="font-semibold">{selectedStudent.fullName}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nueva Contraseña</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold rounded-lg transition-all"
              >
                Restablecer Contraseña
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Edit Course Info Form */}
        {modalType === 'editCourse' && selectedCourse && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título del Curso</label>
              <input
                type="text"
                required
                defaultValue={selectedCourse.title}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
              <select 
                defaultValue={selectedCourse.category}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>DESARROLLO</option>
                <option>CLOUD</option>
                <option>DATA</option>
                <option>DATABASE</option>
                <option>DEVOPS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descripción del curso..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Edit Course Content Form */}
        {modalType === 'editCourseContent' && selectedCourse && (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                Gestionando contenido de <span className="font-semibold">{selectedCourse.title}</span>
              </p>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
              {/* Module 1 */}
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="text-white font-semibold">Módulo 1: Introducción al Desarrollo Web</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openContentModal('editModule', 'm1')}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">Eliminar</button>
                  </div>
                </div>
                <div className="space-y-2 ml-7">
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Video: ¿Qué es el Desarrollo Web?</p>
                        <p className="text-xs text-slate-400">Duración: 12:30 • Orden: 1</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setContentFormData({ ...contentFormData, type: 'video', title: '¿Qué es el Desarrollo Web?', duration: '12:30', order: 1 });
                        openContentModal('editContent', 'm1');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Video: HTML y CSS Moderno</p>
                        <p className="text-xs text-slate-400">Duración: 18:45 • Orden: 2</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setContentFormData({ ...contentFormData, type: 'video', title: 'HTML y CSS Moderno', duration: '18:45', order: 2 });
                        openContentModal('editContent', 'm1');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Reto: Crea tu Primera Página Web</p>
                        <p className="text-xs text-slate-400">Requiere revisión de tutor • Orden: 3</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setContentFormData({ ...contentFormData, type: 'challenge', title: 'Crea tu Primera Página Web', order: 3, requiresTutorReview: true });
                        openContentModal('editContent', 'm1');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  <button 
                    onClick={() => openContentModal('addContent', 'm1')}
                    className="w-full py-2.5 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-red-500 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Video o Reto
                  </button>
                </div>
              </div>

              {/* Module 2 */}
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="text-white font-semibold">Módulo 2: JavaScript Avanzado</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openContentModal('editModule', 'm2')}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">Eliminar</button>
                  </div>
                </div>
                <div className="space-y-2 ml-7">
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Video: Funciones y Closures</p>
                        <p className="text-xs text-slate-400">Duración: 22:15 • Orden: 1</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setContentFormData({ ...contentFormData, type: 'video', title: 'Funciones y Closures', duration: '22:15', order: 1 });
                        openContentModal('editContent', 'm2');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  <button 
                    onClick={() => openContentModal('addContent', 'm2')}
                    className="w-full py-2.5 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-red-500 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Video o Reto
                  </button>
                </div>
              </div>

              <button 
                onClick={() => openContentModal('addModule')}
                className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-red-500 hover:text-red-400 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Nuevo Módulo
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Add Course Form */}
        {modalType === 'addCourse' && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título del Curso</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Desarrollo Web Full Stack"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
              <select className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>DESARROLLO</option>
                <option>CLOUD</option>
                <option>DATA</option>
                <option>DATABASE</option>
                <option>DEVOPS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
              <textarea
                rows={3}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descripción del curso..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Imagen URL</label>
              <input
                type="url"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Crear Curso
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Content Modal (Secondary Modal for adding/editing videos and challenges) */}
      <Modal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} title={getContentModalTitle()}>
        {(contentModalType === 'addModule' || contentModalType === 'editModule') && (
          <form onSubmit={handleSubmitContent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Módulo</label>
              <input
                type="text"
                required
                value={contentFormData.title}
                onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Introducción al Desarrollo Web"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
              <textarea
                rows={3}
                value={contentFormData.description}
                onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descripción del módulo..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Orden</label>
              <input
                type="number"
                required
                min="1"
                value={contentFormData.order}
                onChange={(e) => setContentFormData({ ...contentFormData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                {contentModalType === 'addModule' ? 'Crear Módulo' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => setIsContentModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {(contentModalType === 'addContent' || contentModalType === 'editContent') && (
          <form onSubmit={handleSubmitContent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Contenido</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value="video"
                    checked={contentFormData.type === 'video'}
                    onChange={(e) => setContentFormData({ ...contentFormData, type: e.target.value as 'video' | 'challenge' })}
                    className="w-4 h-4 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-white">Video</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value="challenge"
                    checked={contentFormData.type === 'challenge'}
                    onChange={(e) => setContentFormData({ ...contentFormData, type: e.target.value as 'video' | 'challenge' })}
                    className="w-4 h-4 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-white">Reto</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
              <input
                type="text"
                required
                value={contentFormData.title}
                onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={contentFormData.type === 'video' ? 'Ej: Introducción a React' : 'Ej: Crea tu primera aplicación'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
              <textarea
                rows={3}
                value={contentFormData.description}
                onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descripción del contenido..."
              />
            </div>

            {contentFormData.type === 'video' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">URL del Video</label>
                  <input
                    type="url"
                    required
                    value={contentFormData.url}
                    onChange={(e) => setContentFormData({ ...contentFormData, url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duración (mm:ss)</label>
                  <input
                    type="text"
                    required
                    value={contentFormData.duration}
                    onChange={(e) => setContentFormData({ ...contentFormData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="12:30"
                  />
                </div>
              </>
            )}

            {contentFormData.type === 'challenge' && (
              <div className="space-y-3 p-4 bg-slate-700 rounded-lg">
                <p className="text-sm font-medium text-slate-300 mb-3">Configuración del Reto</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentFormData.requiresEvidence}
                    onChange={(e) => setContentFormData({ ...contentFormData, requiresEvidence: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-500 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Requiere evidencia (imágenes)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentFormData.requiresGithubLink}
                    onChange={(e) => setContentFormData({ ...contentFormData, requiresGithubLink: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-500 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Requiere link de GitHub</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentFormData.requiresTutorReview}
                    onChange={(e) => setContentFormData({ ...contentFormData, requiresTutorReview: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-500 text-red-500 focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Requiere revisión de tutor</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Orden</label>
              <input
                type="number"
                required
                min="1"
                value={contentFormData.order}
                onChange={(e) => setContentFormData({ ...contentFormData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
              >
                {contentModalType === 'addContent' ? 'Agregar Contenido' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => setIsContentModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
      <Footer />
    </div>
  );
}
