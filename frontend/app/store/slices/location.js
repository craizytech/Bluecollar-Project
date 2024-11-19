import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    location: { latitude: null, longitude: null }, // Default values
    county: '',
    address: null,
    error: null,
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation: (state, action) => {
            state.location = action.payload;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        // setCounty: (state, action) => {
        //     state.county = action.payload;
        // },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setLocation, setCounty, setError, setAddress } = locationSlice.actions;
export default locationSlice.reducer;
