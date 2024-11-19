import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import categoryReducer from './slices/categorySlice';
import notificationReducer from './slices/notificationSlice';
import locationReducer from './slices/location';
import serviceProvidersReducer from './slices/serviceProviders';

const store = configureStore({
  reducer: {
    user: userReducer,
    category: categoryReducer,
    notifications: notificationReducer,
    location: locationReducer,
    serviceProviders: serviceProvidersReducer,
  },
});

export default store;
