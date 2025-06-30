import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './assets/pages/AuthPage';
import Home from './assets/pages/Home';
import Quiz from './assets/pages/Quiz';
import ProfilePage from './assets/pages/ProfilePage';
import TableView from './assets/pages/TableView';
import RequestPage from './assets/pages/RequestPage';
import GuitarCategoryPage from './assets/pages/GuitarCategoryPage';
import CartPage from './assets/pages/CartPage';
import { CartProvider } from './assets/context/CartContext';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/table" element={<TableView />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/marketplace/:categorySlug" element={<GuitarCategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
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
    </CartProvider>
  );
}

export default App;