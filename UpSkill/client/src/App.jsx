import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout';
import { Spinner } from './components/common';
import {
    Landing,
    Login,
    Register,
    Dashboard,
    NewAnalysis,
    Results,
    History,
    RewriteResume,
    GitHubAnalyzer
} from './pages';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />
            <main>{children}</main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/analyze" element={<ProtectedRoute><NewAnalysis /></ProtectedRoute>} />
                        <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
                        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                        <Route path="/rewrite" element={<ProtectedRoute><RewriteResume /></ProtectedRoute>} />
                        <Route path="/github" element={<ProtectedRoute><GitHubAnalyzer /></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AppLayout>
            </Router>
        </AuthProvider>
    );
}

export default App;
