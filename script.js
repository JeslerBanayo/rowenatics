// E-Collect Barangay System - Simplified Version
// Real-time waste collection management system

// Global variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase();
    loadCalendar();
    loadUpcomingCollections();
    setupEventListeners();
    startRealTimeUpdates();
    
    // Show main view by default
    // Deep-link support: #history or #report
    const hash = (window.location.hash || '').replace('#', '');
    if (hash === 'history') {
        showSection('history');
    } else if (hash === 'report') {
        showSection('main');
        // Scroll to report form
        const reportSection = document.querySelector('.report-section');
        if (reportSection) reportSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        showSection('main');
    }
    // Initialize notifications list if missing
    if (!localStorage.getItem('userNotifications')) {
        localStorage.setItem('userNotifications', JSON.stringify([]));
    }
});


function initializeDatabase() {
    // Initialize localStorage data if not exists
    if (!localStorage.getItem('wasteReports')) {
        localStorage.setItem('wasteReports', JSON.stringify([]));
    }
    if (!localStorage.getItem('collectionSchedules')) {
        localStorage.setItem('collectionSchedules', JSON.stringify([]));
    }
    if (!localStorage.getItem('systemSettings')) {
        localStorage.setItem('systemSettings', JSON.stringify({
            regularCollectionDays: ['Monday', 'Wednesday', 'Friday'],
            collectionTime: '08:00',
            barangayName: 'Sample Barangay',
            contactNumber: '+63 123 456 7890'
        }));
    }
    
    // Add sample collection schedules if none exist
    const schedules = JSON.parse(localStorage.getItem('collectionSchedules'));
    if (schedules.length === 0) {
        addSampleSchedules();
    }
}

// Add sample collection schedules
function addSampleSchedules() {
    const today = new Date();
    const schedules = [];
    
    // Add schedules for the next 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Regular collection days (Monday, Wednesday, Friday)
        if (['Monday', 'Wednesday', 'Friday'].includes(dayOfWeek)) {
            schedules.push({
                id: 'schedule-' + Date.now() + '-' + i,
                date: date.toISOString().split('T')[0],
                time: '08:00',
                type: 'Regular Collection',
                status: 'scheduled',
                areas: ['Zone 1', 'Zone 2', 'Zone 3'],
                createdDate: new Date().toISOString()
            });
        }
    }
    
    localStorage.setItem('collectionSchedules', JSON.stringify(schedules));
}

// Show different sections
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    if (sectionName === 'main') {
        // Show main content (calendar and report are always visible)
        document.querySelector('.main-grid').style.display = 'grid';
        const sysDesc = document.querySelector('.system-description');
        if (sysDesc) sysDesc.style.display = 'block';
        document.getElementById('history').style.display = 'none';
        document.getElementById('notifications').style.display = 'none';
    } else if (sectionName === 'history') {
        // Show history section
        document.querySelector('.main-grid').style.display = 'none';
        document.querySelector('.system-description').style.display = 'none';
        document.getElementById('history').style.display = 'block';
        document.getElementById('history').classList.add('active');
        loadHistory();
        document.getElementById('notifications').style.display = 'none';
    } else if (sectionName === 'notifications') {
        // Show notifications page
        document.querySelector('.main-grid').style.display = 'none';
        const sysDesc = document.querySelector('.system-description');
        if (sysDesc) sysDesc.style.display = 'none';
        const notif = document.getElementById('notifications');
        notif.style.display = 'block';
        notif.classList.add('active');
        loadNotificationsPage();
        document.getElementById('history').style.display = 'none';
    }
}

// Calendar Functions
function loadCalendar() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    generateCalendar();
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let calendarHTML = '';
    
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="day-header">${day}</div>`;
    });
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += '<div class="calendar-day other-month"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasCollection = hasCollectionOnDate(dateStr);
        const isToday = isTodayDate(currentYear, currentMonth, day);
        
        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' today';
        if (hasCollection) dayClass += ' has-collection';
        
        calendarHTML += `
            <div class="${dayClass}" onclick="showCollectionDetails('${dateStr}')">
                ${day}
            </div>
        `;
    }
    
    calendarGrid.innerHTML = calendarHTML;
}

function hasCollectionOnDate(dateStr) {
    const schedules = JSON.parse(localStorage.getItem('collectionSchedules'));
    return schedules.some(schedule => schedule.date === dateStr);
}

function isTodayDate(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    loadCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadCalendar();
}

function showCollectionDetails(dateStr) {
    const schedules = JSON.parse(localStorage.getItem('collectionSchedules'));
    const schedule = schedules.find(s => s.date === dateStr);
    
    if (schedule) {
        const date = new Date(dateStr);
        const dateFormatted = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const collectorInfo = schedule.collector ? ` with ${schedule.collector}` : '';
        showNotification('success', 'Collection Scheduled', 
            `${schedule.type} on ${dateFormatted} at ${schedule.time}${collectorInfo}`);
    }
}

// Load upcoming collections
function loadUpcomingCollections() {
    const schedules = JSON.parse(localStorage.getItem('collectionSchedules'));
    const today = new Date().toISOString().split('T')[0];
    const upcoming = schedules
        .filter(schedule => schedule.date >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    const container = document.getElementById('upcomingCollections');
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p>No upcoming collections scheduled.</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(schedule => {
        const date = new Date(schedule.date);
        const dateFormatted = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const collector = schedule.collector ? ` — Collector: ${schedule.collector}` : '';
        return `
            <div class="upcoming-item">
                <div>
                    <div class="upcoming-date">${dateFormatted}</div>
                    <div class="upcoming-type">${schedule.type} at ${schedule.time}${collector}</div>
                </div>
                <div>🗑️</div>
            </div>
        `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Waste report form
    document.getElementById('wasteReportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitWasteReport();
    });
}

// Submit waste report
function submitWasteReport() {
    const reportData = {
        id: 'report-' + Date.now(),
        residentName: document.getElementById('residentName').value,
        residentAddress: document.getElementById('residentAddress').value,
        residentPhone: document.getElementById('residentPhone').value,
        wasteType: document.getElementById('wasteType').value,
        wasteDescription: document.getElementById('wasteDescription').value,
        urgency: document.getElementById('urgency').value,
        status: 'pending',
        reportDate: new Date().toISOString(),
        scheduledDate: null,
        completedDate: null,
        assignedCollector: null
    };
    
    const reports = JSON.parse(localStorage.getItem('wasteReports'));
    reports.push(reportData);
    localStorage.setItem('wasteReports', JSON.stringify(reports));
    
    // Show success notification
    showNotification('success', 'Report Submitted', 
        'Your waste collection report has been submitted successfully. You will be notified when it is scheduled.');
    
    // Clear form
    document.getElementById('wasteReportForm').reset();
    
    // Reload history
    loadHistory();
    
    // Simulate real-time notification to admin (in a real system, this would be server-side)
    setTimeout(() => {
        if (window.parent !== window) {
            // If this is in an iframe or admin is viewing, notify admin
            window.parent.postMessage({
                type: 'newWasteReport',
                data: reportData
            }, '*');
        }
    }, 1000);
}

// Load history
function loadHistory() {
    const reports = JSON.parse(localStorage.getItem('wasteReports'));
    const historyList = document.getElementById('historyList');
    
    if (reports.length === 0) {
        historyList.innerHTML = '<p>No waste collection reports found.</p>';
        return;
    }
    
    // Sort by report date (newest first)
    const sortedReports = reports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
    
    historyList.innerHTML = sortedReports.map(report => `
        <div class="history-item ${report.status}">
            <div class="history-header">
                <div class="history-title">${report.wasteType} Collection Report</div>
                <div class="history-status ${report.status}">${report.status}</div>
            </div>
            <div class="history-details">
                <div class="history-detail">
                    <div class="history-label">Your Name</div>
                    <div class="history-value">${report.residentName}</div>
                </div>
                <div class="history-detail">
                    <div class="history-label">Address</div>
                    <div class="history-value">${report.residentAddress}</div>
                </div>
                <div class="history-detail">
                    <div class="history-label">Waste Type</div>
                    <div class="history-value">${report.wasteType}</div>
                </div>
                <div class="history-detail">
                    <div class="history-label">Urgency</div>
                    <div class="history-value">${report.urgency}</div>
                </div>
                <div class="history-detail">
                    <div class="history-label">Report Date</div>
                    <div class="history-value">${new Date(report.reportDate).toLocaleDateString()}</div>
                </div>
                ${report.scheduledDate ? `
                    <div class="history-detail">
                        <div class="history-label">Scheduled Date</div>
                        <div class="history-value">${new Date(report.scheduledDate).toLocaleDateString()}</div>
                    </div>
                ` : ''}
                ${report.assignedCollector ? `
                    <div class="history-detail">
                        <div class="history-label">Collector</div>
                        <div class="history-value">${report.assignedCollector}</div>
                    </div>
                ` : ''}
            </div>
            ${report.wasteDescription ? `
                <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                    <strong>Description:</strong> ${report.wasteDescription}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Filter history
function filterHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const filterValue = document.getElementById('historyFilter').value;
    const reports = JSON.parse(localStorage.getItem('wasteReports'));
    
    let filteredReports = reports;
    
    // Apply status filter
    if (filterValue !== 'all') {
        filteredReports = filteredReports.filter(report => report.status === filterValue);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredReports = filteredReports.filter(report => 
            report.residentName.toLowerCase().includes(searchTerm) ||
            report.residentAddress.toLowerCase().includes(searchTerm) ||
            report.wasteType.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update display
    const historyList = document.getElementById('historyList');
    
    if (filteredReports.length === 0) {
        historyList.innerHTML = '<p>No reports found matching your criteria.</p>';
        return;
    }
    
    // Sort by report date (newest first)
    const sortedReports = filteredReports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
    
    historyList.innerHTML = sortedReports.map(report => `
        <div class="history-item ${report.status}">
            <div class="history-header">
                <div class="history-title">${report.wasteType} Collection Report</div>
                <div class="history-status ${report.status}">${report.status}</div>
            </div>
            <div class="history-details">
                <div class="history-detail">
                    <div class="history-label">Your Name</div>
                    <div class="history-value">${report.residentName}</div>
                </div>
                <div class="history-detail">
                    <div class="history-label">Address</div>
                    <div class="history-value">${report.residentAddress}</div>
                </div>
                <div class="history-detail">
                    <div class="history-label">Waste Type</div>
                    <div class="history-value">${report.wasteType}</div>
                </div>
                <div class="history-detail">
                    <div class="history-label">Urgency</div>
                    <div class="history-value">${report.urgency}</div>
                </div>
                <div class="history-detail">
                    <div class="history-label">Report Date</div>
                    <div class="history-value">${new Date(report.reportDate).toLocaleDateString()}</div>
                </div>
                ${report.scheduledDate ? `
                    <div class="history-detail">
                        <div class="history-label">Scheduled Date</div>
                        <div class="history-value">${new Date(report.scheduledDate).toLocaleDateString()}</div>
                    </div>
                ` : ''}
                ${report.assignedCollector ? `
                    <div class="history-detail">
                        <div class="history-label">Collector</div>
                        <div class="history-value">${report.assignedCollector}</div>
                    </div>
                ` : ''}
            </div>
            ${report.wasteDescription ? `
                <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                    <strong>Description:</strong> ${report.wasteDescription}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Notification system
function showNotification(type, title, message) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);

    // Persist to local notifications list for the page
    try {
        const all = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        all.unshift({ id: 'n-' + Date.now(), type, title, message, read: false, timestamp: new Date().toISOString() });
        localStorage.setItem('userNotifications', JSON.stringify(all));
        updateNotificationBadgeCount();
    } catch (_) {}
}

// Real-time updates
function startRealTimeUpdates() {
    // Check for updates every 30 seconds
    setInterval(() => {
        loadUpcomingCollections();
        loadHistory();
    }, 30000);
    
    // Cross-tab real-time notifications via localStorage events
    window.addEventListener('storage', function(e) {
        if (e.key === 'broadcastNotification' && e.newValue) {
            try {
                const payload = JSON.parse(e.newValue);
                const typeMap = { success: 'success', warning: 'warning', error: 'error', info: 'info' };
                showNotification(typeMap[payload.type] || 'info', payload.title || 'Notification', payload.message || '');
                loadCalendar();
                loadUpcomingCollections();
                loadHistory(); // reflect any state changes
                if (document.getElementById('notifications')?.classList.contains('active')) {
                    loadNotificationsPage();
                }
            } catch (_) {}
        }
    });
}

// Notifications page helpers
function loadNotificationsPage() {
    const list = document.getElementById('notificationsList');
    const all = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    if (all.length === 0) {
        list.innerHTML = '<p>No notifications yet.</p>';
        return;
    }
    list.innerHTML = all.map(n => `
        <div class="history-item ${n.type}">
            <div class="history-header">
                <div class="history-title">${n.title}</div>
                <div class="history-status ${n.type}">${new Date(n.timestamp).toLocaleString()}</div>
            </div>
            <div class="history-details">
                <div class="history-detail">
                    <div class="history-label">Message</div>
                    <div class="history-value">${n.message}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function markAllNotificationsRead() {
    const all = JSON.parse(localStorage.getItem('userNotifications') || '[]').map(n => ({ ...n, read: true }));
    localStorage.setItem('userNotifications', JSON.stringify(all));
    updateNotificationBadgeCount();
    loadNotificationsPage();
}

function clearAllNotifications() {
    localStorage.setItem('userNotifications', JSON.stringify([]));
    updateNotificationBadgeCount();
    loadNotificationsPage();
}

function updateNotificationBadgeCount() {
    const all = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    const unread = all.filter(n => !n.read).length;
    // Optional: implement a small badge near nav Notifications link if desired
}

// Export functions for admin use
window.ECollectUser = {
    showNotification,
    loadCalendar,
    loadUpcomingCollections,
    loadHistory
};