import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Authentication Context
 * Manages user authentication state across the application
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Check if user is authenticated on mount
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/auth/profile');
                    setUser(response.data.data.user);
                } catch (error) {
                    // Token invalid, clear it
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    /**
     * Login user with credentials
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} - User data
     */
    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { user: userData, token: newToken } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    /**
     * Register new user
     * @param {string} name 
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} - User data
     */
    const register = async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        const { user: userData, token: newToken } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    /**
     * Logout current user
     */
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
