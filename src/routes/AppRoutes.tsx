import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Student from '../pages/Student/index';
import StudentCoursesPage from '../pages/Student/StudentCoursesPage';
import CourseView from '../pages/Student/CourseView';
import ContentView from '../pages/Student/ContentView';
import Admin from '../pages/Admin/index';
import Tutor from '../pages/Tutor/index';
import Meetings from '../pages/Student/Meetings';
import Reports from '../pages/Reports';
import MainLayout from '../layouts/MainLayout';

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
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/tutor" element={<Tutor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
