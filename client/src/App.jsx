import { Navigate, Route, Routes } from 'react-router-dom';
import Register from './components/auth/register';
import Dashboard from './components/dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const hasUser = () => Boolean(localStorage.getItem('user'));

const RequireAuth = ({ children }) =>
  hasUser() ? children : <Navigate to="/register" replace />;

const PublicOnly = ({ children }) =>
  hasUser() ? <Navigate to="/dashboard" replace /> : children;

const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={hasUser() ? '/dashboard' : '/register'} replace />
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <Register />
            </PublicOnly>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
};

export default App;
