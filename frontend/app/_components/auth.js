// auth.js

// Function to check if the user is authenticated based on the presence of JWT token
export function isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return token !== null && token !== undefined;
}

// Function to store the hardcoded JWT token
export function handleLogin() {
    try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcxODY3NDQ4NSwianRpIjoiYmQ3OTllMGMtNjVkZi00MDA0LWI4ZWItN2FkMTY3NzBmYjU1IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNzE4Njc0NDg1LCJjc3JmIjoiMWM1ZGVlNjgtN2E1Yi00NTI4LWIwZjMtOGRlYzE5MTI2NzgxIiwiZXhwIjoxNzE4Njc1Mzg1fQ.LCSGKOCYGzlsHLie5RSa_9-7rFcYGlz-7MfWyrj8OfU";

        // Store token in local storage
        localStorage.setItem('accessToken', token);
        return true;
    } catch (error) {
        console.error('Error during authentication:', error);
        return false;
    }
}

// Function to include JWT token in request headers when making authenticated requests
export async function fetchUserData() {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            return null;
        }

        const response = await fetch('http://localhost:5000/api/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}
