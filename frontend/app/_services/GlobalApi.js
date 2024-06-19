const BASE_URL = 'http://localhost:5000/api';

// Fetch the user's access token
// import { getAccessToken } from './auth'; // Uncomment if you have this function in your auth module

async function fetchUserProfile() {
  try {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

async function fetchUserServices(userId) {
  try {
    const response = await fetch(`${BASE_URL}/services/category/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user services');
    }
    const data = await response.json();
    // Fetch category name for each service
    const servicesWithData = await Promise.all(data.map(async (service) => {
      const categoryResponse = await fetch(`${BASE_URL}/services/category/${service.category_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!categoryResponse.ok) {
        throw new Error('Failed to fetch service category');
      }
      const categoryData = await categoryResponse.json();
      return { ...service, category_name: categoryData.category_name };
    }));
    return servicesWithData;
  } catch (error) {
    console.error('Error fetching user services:', error);
    throw error;
  }
}

async function fetchServiceCategory(categoryId) {
  try {
    const response = await fetch(`${BASE_URL}/services/category/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch service category');
    }
    const data = await response.json();
    return data.category_name;
  } catch (error) {
    console.error('Error fetching service category:', error);
    throw error;
  }
}

async function fetchServiceDescription(serviceId) {
  try {
    const response = await fetch(`${BASE_URL}/services/${serviceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch service description');
    }
    const data = await response.json();
    return data.service_description;
  } catch (error) {
    console.error('Error fetching service description:', error);
    throw error;
  }
}

async function createBooking(bookingData) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

async function checkSlotBooked(date) {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await fetch(`${BASE_URL}/bookings/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ date })
    });

    if (!response.ok) {
      throw new Error('Failed to check booked slots');
    }

    const data = await response.json();
    return data.isBooked;
  } catch (error) {
    console.error('Error checking booked slots:', error);
    throw error;
  }
}

export {
  fetchUserProfile,
  fetchUserServices,
  fetchServiceCategory,
  fetchServiceDescription,
  createBooking,
  checkSlotBooked
};
