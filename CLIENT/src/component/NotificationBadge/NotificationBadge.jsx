import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import './notificationBadge.scss';

function NotificationBadge() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, removeNotification, clearAllNotifications } = useSocket();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    // Remove the notification when clicked
    removeNotification(notification.id);
    setShowNotifications(false);
    
    // Here you could navigate to the chat or perform other actions
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="notification-badge" ref={dropdownRef}>
      <button 
        className="notification-trigger"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <span className="icon">🔔</span>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={clearAllNotifications}
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span>No notifications</span>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div 
                  key={notification.id}
                  className="notification-item"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p className="message">{notification.text}</p>
                    <span className="time">{formatTime(notification.timestamp)}</span>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBadge; 