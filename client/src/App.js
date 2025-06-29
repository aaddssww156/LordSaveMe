import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './assets/pages/AuthPage';
import Home from './assets/pages/Home';
import Quiz from './assets/pages/Quiz';
import ProfilePage from './assets/pages/ProfilePage';
import TableView from './assets/pages/TableView';
import RequestPage from './assets/pages/RequestPage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/table" element={<TableView />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route
          path="/profile/:userId?"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user_requests"
          element={
            <ProtectedRoute>
              <RequestPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;