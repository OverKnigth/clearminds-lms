import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '@/features/public/presentation/pages/Landing';
import Login from '@/features/public/presentation/pages/Login';
import ForgotPassword from '@/features/public/presentation/pages/ForgotPassword';
import ResetPassword from '@/features/public/presentation/pages/ResetPassword';
import Student from '@/features/student/presentation/pages/index.tsx';
import StudentCoursesPage from '@/features/student/presentation/pages/StudentCoursesPage';
import CourseView from '@/features/student/presentation/pages/CourseView';
import ContentView from '@/features/student/presentation/pages/ContentView';
import Admin from '@/features/admin/presentation/pages/index.tsx';
import Tutor from '@/features/tutor/presentation/pages/index.tsx';
import Meetings from '@/features/student/presentation/pages/Meetings';
import Profile from '@/features/student/presentation/pages/Profile';
import MainLayout from '@/shared/layouts/MainLayout';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Student />} />
          <Route path="/courses" element={<StudentCoursesPage />} />
          <Route path="/course/:courseSlug" element={<CourseView />} />
          <Route path="/course/:courseSlug/content/:contentSlug" element={<ContentView />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tutor" element={<Tutor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
