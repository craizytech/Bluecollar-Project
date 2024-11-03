"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateNotificationReadStatus, fetchNotifications } from '../store/slices/notificationSlice';
import { useRouter } from 'next/navigation';

function Notifications() {
    const dispatch = useDispatch();
    const router = useRouter();
    const notifications = useSelector((state) => state.notifications.notifications);
    const userId = useSelector((state) => state.user.userId);

    useEffect(() => {
        if (userId) {
            // Fetch notifications when the user ID is available
            dispatch(fetchNotifications(userId)); // Implement this action to fetch notifications
        }
    }, [dispatch, userId]);
  
  const notificationList = notifications || []; 

  const sortedNotifications = [...notificationList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const groupedNotifications = sortedNotifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = [];
    }
    acc[notification.type].push(notification);
    return acc;
  }, {});

  const handleNotificationClick = async (notification) => {
    if (notification.type === 'booking') {
        router.push(`/todoServices`);
    } else if (notification.type === 'booking_status') {
        router.push(`/mybooking`);
    } else if (notification.type === 'chat') {
        router.push(`/chat`)
    } else {
        router.push(`/Home`)
    }

    if (!notification.read) {
      await dispatch(updateNotificationReadStatus({ notificationId: notification.id, userId })); // Adjust to your store's action
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Your Notifications</h2>
      {Object.keys(groupedNotifications).length === 0 ? (
        <div className="text-gray-500">No notifications available</div>
      ) : (
        Object.keys(groupedNotifications).map((type) => (
          <div key={type} className="mb-6">
            <h3 className="text-lg font-bold text-blue-600 mb-2">{type}</h3>
            <ul className="space-y-4">
              {groupedNotifications[type].map((notification, index) => (
                <li 
                key={index}
                onClick={() => handleNotificationClick(notification)} 
                className={`p-4 border border-gray-200 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'} transition duration-150 ease-in-out cursor-pointer`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-gray-800">{notification.message}</strong>
                    </div>
                    <small className="text-gray-500 text-sm">{new Date(notification.created_at).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;
