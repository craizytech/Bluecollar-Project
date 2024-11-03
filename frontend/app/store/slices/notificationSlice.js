import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (userId) => {
    const response = await fetch(`http://localhost:5000/api/notifications/${userId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }
    const data = await response.json();
    return data; // Return the notifications for the reducer
});


export const updateNotificationReadStatus = createAsyncThunk(
    'notifications/updateReadStatus',
    async ({ notificationId, userId }) => {
    const response = await fetch(`http://localhost:5000/api/notifications/${userId}/read/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to update notification read status');
    }
    return notificationId; // Return the notification ID for the reducer
  });

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.newNotificationCount = action.payload.filter(notification => !notification.read).length;
    },
    clearNotifications: (state) => {
        state.notifications = [];
        state.newNotificationCount = 0;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
      state.newNotificationCount += 1;
    },
    resetNotificationCount: (state) => {
      state.newNotificationCount = 0;
    },
  },

  extraReducers: (builder) => {
    builder
        .addCase(fetchNotifications.fulfilled, (state, action) => {
            state.notifications = action.payload;
            state.newNotificationCount = action.payload.filter(notification => !notification.read).length;
        })
      .addCase(updateNotificationReadStatus.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true; // Update the read status in the state
        }
      });
  },
});

export const { setNotifications, clearNotifications, addNotification, resetNotificationCount } = notificationSlice.actions;
export default notificationSlice.reducer;