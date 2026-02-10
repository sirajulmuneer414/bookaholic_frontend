import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'));

// User Pages
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const BooksCatalog = lazy(() => import('./pages/user/BooksCatalog'));
const BookDetails = lazy(() => import('./pages/user/BookDetails'));
const MyBooks = lazy(() => import('./pages/user/MyBooks'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageBooks = lazy(() => import('./pages/admin/ManageBooks'));
const BorrowRecords = lazy(() => import('./pages/admin/BorrowRecords'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const UserDetails = lazy(() => import('./pages/admin/UserDetails'));

// Loading component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--color-gray-50)'
  }}>
    <div className="spinner spinner-primary"></div>
  </div>
);

// Root redirect component
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Root and Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* User Protected Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute requiredRole="USER">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/books"
              element={
                <ProtectedRoute requiredRole="USER">
                  <BooksCatalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/books/:id"
              element={
                <ProtectedRoute requiredRole="USER">
                  <BookDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/my-books"
              element={
                <ProtectedRoute requiredRole="USER">
                  <MyBooks />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <ManageBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/records"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <BorrowRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <UserDetails />
                </ProtectedRoute>
              }
            />

            {/* Fallback - Redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;