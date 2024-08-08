import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        profile: null,
    });

    const router = useRouter();

    useEffect(() =>{
        const token = localStorage.getItem('access_token');
        const profileString = localStorage.getItem('user_profile');
        // const profile = profileString ? JSON.parse(profileString) : null;
        if (token) {
            setAuthState({ token });
        }
    }, []);

    const setTokenAndProfile = (token) => {
        localStorage.setItem('access_token', token);
        // localStorage.setItem('user_profile', JSON.stringify(profile));
        setAuthState({ token });
    };

    const logout = async () => {
        const token = authState.token;
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_profile');
                setAuthState({ token: null });
                router.push('/');
            } else {
                console.error('Failed to log out:', response.statusText);
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ authState, setTokenAndProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;