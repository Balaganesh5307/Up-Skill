import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/auth/profile');
                    setUser(response.data.data.user);
                } catch (error) {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { user: userData, token: newToken } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    const register = async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        const { user: userData, token: newToken } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    const googleLogin = async (jwtToken) => {
        try {
            localStorage.setItem('token', jwtToken);
            setToken(jwtToken);

            const response = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${jwtToken}` }
            });
            const userData = response.data.data.user;
            setUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            return {
                success: false,
                error: error.response?.data?.message || 'Google login failed'
            };
        }
    };

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
        googleLogin,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
