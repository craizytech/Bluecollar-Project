// store/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userEmail: null,
    userRole: null,
    userId: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.userEmail = action.payload.userEmail;
      state.userRole = action.payload.userRole;
      state.userId = action.payload.userId;
    },
    clearUser: (state) => {
      state.userEmail = null;
      state.userRole = null;
      state.userId = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;