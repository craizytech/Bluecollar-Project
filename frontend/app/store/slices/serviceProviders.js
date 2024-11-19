// store/slices/serviceProviders.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch service providers and their locations
export const fetchServiceProviders = createAsyncThunk(
    'serviceProviders/fetchServiceProviders',
    async (_, { rejectWithValue }) => {
        try {
            const servicesResponse = await fetch('http://localhost:5000/api/services/all');
            const servicesData = await servicesResponse.json();

            const providersPromises = servicesData.map(async (service) => {
                const profileResponse = await fetch(`http://localhost:5000/api/users/profile/${service.provider_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                const profileData = await profileResponse.json();
                // return profileResponse.json();

                // Add service details along with provider details
                return {
                    provider: profileData,
                    providerId: service.provider_id,
                    serviceId: service.service_id,
                    categoryId: service.category_id,
                    serviceDescription: service.service_description,
                    serviceName: service.service_name
                };
            });


            const providers = await Promise.all(providersPromises);
            return providers.filter(provider => provider.provider.user_location && provider.provider.user_name);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const serviceProvidersSlice = createSlice({
    name: 'serviceProviders',
    initialState: {
        providers: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchServiceProviders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchServiceProviders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.providers = action.payload;
            })
            .addCase(fetchServiceProviders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default serviceProvidersSlice.reducer;
