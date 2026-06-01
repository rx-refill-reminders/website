import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Home } from './pages/Home';
import { Callback } from './pages/Callback';

export function App(): JSX.Element {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </AuthProvider>
  );
}

