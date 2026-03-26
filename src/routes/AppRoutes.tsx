import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import CourseView from '../pages/CourseView';
import VideoPlayer from '../pages/VideoPlayer';
import Tutoring from '../pages/Tutoring';
import Admin from '../pages/Admin';
import Meetings from '../pages/Meetings';
import MainLayout from '../layouts/MainLayout';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:courseId" element={<CourseView />} />
          <Route path="/course/:courseId/video/:videoId" element={<VideoPlayer />} />
          <Route path="/tutoring" element={<Tutoring />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
