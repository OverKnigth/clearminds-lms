import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import CourseView from '../pages/CourseView';
import VideoPlayer from '../pages/VideoPlayer';
import Tutoring from '../pages/Tutoring';
import Admin from '../pages/Admin';
import Tutor from '../pages/Tutor';
import Meetings from '../pages/Meetings';
import Reports from '../pages/Reports';
import MainLayout from '../layouts/MainLayout';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:courseId" element={<CourseView />} />
          <Route path="/course/:courseId/video/:videoId" element={<VideoPlayer />} />
          <Route path="/tutoring" element={<Tutoring />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/tutor" element={<Tutor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
