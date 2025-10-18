// Notification System for E-Collect Barangay System

class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        this.setupNotificationDisplay();
    }

    // Add a new notification
    addNotification(type, title, message, data = {}) {
        const notification = {
            id: 'notif-' + Date.now(),
            type: type, // 'info', 'success', 'warning', 'error'
            title: title,
            message: message,
            data: data,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(notification);
        this.saveNotifications();
        this.showNotification(notification);
        this.updateNotificationBadge();
    }

    // Show notification popup
    showNotification(notification) {
        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        notificationEl.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add to notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notificationEl);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notificationEl.parentElement) {
                notificationEl.remove();
            }
        }, 5000);
    }

    // Setup notification display in UI
    setupNotificationDisplay() {
        // Add notification styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                }

                .notification {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    margin-bottom: 10px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    animation: slideInRight 0.3s ease;
                    border-left: 4px solid #2E8B57;
                }

                .notification-info {
                    border-left-color: #007BFF;
                }

                .notification-success {
                    border-left-color: #28A745;
                }

                .notification-warning {
                    border-left-color: #FFC107;
                }

                .notification-error {
                    border-left-color: #DC3545;
                }

                .notification-content {
                    flex: 1;
                }

                .notification-title {
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 5px;
                }

                .notification-message {
                    color: #666;
                    font-size: 0.9rem;
                }

                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #999;
                    margin-left: 10px;
                }

                .notification-close:hover {
                    color: #333;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #DC3545;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Update notification badge
    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update badge in navigation if exists
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    // Mark notification as read
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationBadge();
        }
    }

    // Mark all notifications as read
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateNotificationBadge();
    }

    // Get unread notifications
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read);
    }

    // Get all notifications
    getAllNotifications() {
        return this.notifications;
    }

    // Save notifications to localStorage
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    // Clear all notifications
    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.updateNotificationBadge();
    }
}

// Initialize notification system
const notificationSystem = new NotificationSystem();

// Notification helper functions
function notifyRequestSubmitted(requestId) {
    notificationSystem.addNotification(
        'success',
        'Request Submitted',
        `Your waste collection request ${requestId} has been submitted successfully.`,
        { requestId: requestId }
    );
}

function notifyRequestAssigned(requestId, collectorName) {
    notificationSystem.addNotification(
        'info',
        'Request Assigned',
        `Your request ${requestId} has been assigned to collector ${collectorName}.`,
        { requestId: requestId, collectorName: collectorName }
    );
}

function notifyRequestCompleted(requestId) {
    notificationSystem.addNotification(
        'success',
        'Request Completed',
        `Your waste collection request ${requestId} has been completed.`,
        { requestId: requestId }
    );
}

function notifyNewResident(residentName) {
    notificationSystem.addNotification(
        'info',
        'New Resident',
        `New resident ${residentName} has registered in the system.`,
        { residentName: residentName }
    );
}

function notifyCollectionScheduled(requestId, collectionDate) {
    notificationSystem.addNotification(
        'info',
        'Collection Scheduled',
        `Collection for request ${requestId} has been scheduled for ${new Date(collectionDate).toLocaleDateString()}.`,
        { requestId: requestId, collectionDate: collectionDate }
    );
}

// Auto-notification triggers
function setupAutoNotifications() {
    // Check for pending requests that need attention
    setInterval(() => {
        const wasteRequests = JSON.parse(localStorage.getItem('wasteRequests') || '[]');
        const today = new Date();
        
        wasteRequests.forEach(request => {
            if (request.status === 'pending') {
                const preferredDate = new Date(request.preferredDate);
                const daysUntilPreferred = Math.ceil((preferredDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilPreferred <= 1 && daysUntilPreferred >= 0) {
                    notificationSystem.addNotification(
                        'warning',
                        'Collection Reminder',
                        `Request ${request.requestId} is scheduled for collection tomorrow.`,
                        { requestId: request.requestId }
                    );
                }
            }
        });
    }, 24 * 60 * 60 * 1000); // Check daily
}

// Initialize auto-notifications
setupAutoNotifications();

// Export for use in other scripts
window.NotificationSystem = notificationSystem;
window.notifyRequestSubmitted = notifyRequestSubmitted;
window.notifyRequestAssigned = notifyRequestAssigned;
window.notifyRequestCompleted = notifyRequestCompleted;
window.notifyNewResident = notifyNewResident;
window.notifyCollectionScheduled = notifyCollectionScheduled;

