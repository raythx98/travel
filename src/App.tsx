import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import GoalInput from '@/pages/GoalInput';
import SessionList from '@/pages/SessionList';
import SessionStream from '@/pages/SessionStream';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GoalInput />} />
        <Route path="/sessions" element={<SessionList />} />
        <Route path="/sessions/:id" element={<SessionStream />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
