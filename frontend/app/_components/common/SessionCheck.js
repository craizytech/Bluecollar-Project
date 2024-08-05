"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleSessionExpiration } from '../../utils/auth';

const SessionCheck = () => {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/check-session', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });

                if (response.status === 401) {
                    // Session expired
                    handleSessionExpiration();
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        };

        checkSession();
    }, [router]);

    return null;
};

export default SessionCheck;
