import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MigrationPage from '../pages/MigrationPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<MigrationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
