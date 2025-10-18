// E-Collect Admin Dashboard - Simplified Version
// Real-time admin management system

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    (async function() {
        initializeAdminDashboard();
        await loadDashboardData();
        setupAdminEventListeners();
        startRealTimeUpdates();
    })();
});

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('adminSidebar');
    const navLinks = document.getElementById('adminNavLinks');
    
    if (window.innerWidth <= 768) {
        if (navLinks.style.display === 'none' || navLinks.style.display === '') {
            navLinks.style.display = 'flex';
            sidebar.style.height = 'auto';
        } else {
            navLinks.style.display = 'none';
        }
    }
}

// Initialize admin dashboard
function initializeAdminDashboard() {
    // Set minimum date for scheduling to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('scheduleDate').setAttribute('min', today);
}

// Setup admin event listeners
function setupAdminEventListeners() {
    // Schedule form submission
    document.getElementById('scheduleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addCollectionSchedule();
    });
    
    // Notification form submission
    document.getElementById('notificationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        sendBulkNotification();
    });

    // Schedule report modal submit
    const scheduleReportForm = document.getElementById('scheduleReportForm');
    if (scheduleReportForm) {
        scheduleReportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const reportId = document.getElementById('scheduleReportId').value;
            const collectorName = document.getElementById('collectorName').value.trim();
            const day = parseInt(document.getElementById('scheduledDay').value, 10);
            if (!collectorName || !day) return;

            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1; // 1-12
            const paddedMonth = String(month).padStart(2, '0');
            const paddedDay = String(day).padStart(2, '0');
            const scheduledDate = `${year}-${paddedMonth}-${paddedDay}`;

            const reports = await fetchReports();
            const report = reports.find(r => r.id === reportId);
            if (report) {
                report.status = 'scheduled';
                report.assignedCollector = collectorName;
                report.scheduledDate = scheduledDate;
                await saveReports(reports);

                // Also create/update an entry in collectionSchedules so users see it on the calendar
                const schedules = await fetchSchedules();
                schedules.push({
                    id: 'schedule-' + Date.now(),
                    date: scheduledDate,
                    time: '08:00',
                    type: `${report.wasteType || 'Waste'} Collection`,
                    areas: null,
                    notes: `Scheduled via report ${report.id}`,
                    status: 'scheduled',
                    createdDate: new Date().toISOString(),
                    collector: collectorName
                });
                await saveSchedules(schedules);
                showAdminNotification('success', 'Report Scheduled', `Waste collection scheduled for ${report.residentName} on ${new Date(scheduledDate).toLocaleDateString()}`);
                closeModal('scheduleReportModal');
                scheduleReportForm.reset();
                await loadReports();
                await loadDashboardData();
                await loadSchedule();

                // Notify user
                if (window.opener && window.opener.ECollectUser) {
                    window.opener.ECollectUser.showNotification('info', 'Schedule Updated', 'Your waste collection has been scheduled. Check the calendar for details.');
                }
            }
        });
    }
}

// Show different admin sections
function showAdminSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav links
    const navLinks = document.querySelectorAll('.admin-nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById('admin-' + sectionName).classList.add('active');
    
    // Add active class to nav link
    event.target.classList.add('active');
    
    // Load section-specific data
switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'reports':
            loadReports();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'history':
            loadHistory();
            break;
        case 'collectors':
            // static section
            break;
    }
}

// Load dashboard data
async function loadDashboardData() {
    const reports = await fetchReports();
    const schedules = await fetchSchedules();
    
    // Update stats
    document.getElementById('totalReports').textContent = reports.length;
    document.getElementById('pendingReports').textContent = reports.filter(r => r.status === 'pending').length;
    document.getElementById('scheduledCollections').textContent = schedules.filter(s => s.status === 'scheduled').length;
    document.getElementById('completedCollections').textContent = reports.filter(r => r.status === 'completed').length;
    
    // Load recent activity
    await loadRecentActivity();
}

// Load recent activity
async function loadRecentActivity() {
    const reports = await fetchReports();
    const schedules = await fetchSchedules();
    
    // Combine and sort activities
    const activities = [];
    
    // Add recent reports
    reports.slice(-5).forEach(report => {
        activities.push({
            type: 'report',
            title: `New waste report from ${report.residentName}`,
            time: new Date(report.reportDate),
            icon: '📝',
            status: report.status
        });
    });
    
    // Add recent schedules
    schedules.slice(-3).forEach(schedule => {
        activities.push({
            type: 'schedule',
            title: `Collection scheduled for ${new Date(schedule.date).toLocaleDateString()}`,
            time: new Date(schedule.createdDate),
            icon: '📅',
            status: schedule.status
        });
    });
    
    // Sort by time and take latest 10
    activities.sort((a, b) => b.time - a.time);
    const recentActivities = activities.slice(0, 10);
    
    // Display activities
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time.toLocaleString()}</div>
            </div>
            <div class="activity-status ${activity.status}">${activity.status}</div>
        </div>
    `).join('');
}

// Load reports
async function loadReports() {
    const reports = await fetchReports();
    const reportsList = document.getElementById('reportsList');
    
    if (reports.length === 0) {
        reportsList.innerHTML = '<p>No waste collection reports found.</p>';
        return;
    }
    
    // Sort by report date (newest first)
    const sortedReports = reports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
    
    reportsList.innerHTML = sortedReports.map(report => `
        <div class="report-card ${report.status}">
            <div class="report-header">
                <div class="report-title">${report.wasteType} Collection Report</div>
                <div class="report-status ${report.status}">${report.status}</div>
            </div>
            <div class="report-details">
                <div class="report-detail">
                    <strong>Resident:</strong> ${report.residentName}
                </div>
                <div class="report-detail">
                    <strong>Address:</strong> ${report.residentAddress}
                </div>
                <div class="report-detail">
                    <strong>Phone:</strong> ${report.residentPhone}
                </div>
                <div class="report-detail">
                    <strong>Urgency:</strong> ${report.urgency}
                </div>
                <div class="report-detail">
                    <strong>Report Date:</strong> ${new Date(report.reportDate).toLocaleDateString()}
                </div>
                ${report.scheduledDate ? `
                    <div class="report-detail">
                        <strong>Scheduled:</strong> ${new Date(report.scheduledDate).toLocaleDateString()}
                    </div>
                ` : ''}
                ${report.assignedCollector ? `
                    <div class="report-detail">
                        <strong>Collector:</strong> ${report.assignedCollector}
                    </div>
                ` : ''}
            </div>
            ${report.wasteDescription ? `
                <div class="report-description">
                    <strong>Description:</strong> ${report.wasteDescription}
                </div>
            ` : ''}
            <div class="report-actions">
                ${report.status === 'pending' ? `
                    <button class="btn-small btn-primary" onclick="scheduleReport('${report.id}')">Schedule</button>
                ` : ''}
                ${report.status === 'scheduled' ? `
                    <button class="btn-small btn-success" onclick="completeReport('${report.id}')">Complete</button>
                ` : ''}
                <button class="btn-small btn-secondary" onclick="viewReportDetails('${report.id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

// Load schedule
async function loadSchedule() {
    const schedules = await fetchSchedules();
    const scheduleList = document.getElementById('scheduleList');
    
    if (schedules.length === 0) {
        scheduleList.innerHTML = '<p>No collection schedules found.</p>';
        return;
    }
    
    // Sort by date
    const sortedSchedules = schedules.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    scheduleList.innerHTML = sortedSchedules.map(schedule => `
        <div class="schedule-card ${schedule.status}">
            <div class="schedule-header">
                <div class="schedule-title">${schedule.type}</div>
                <div class="schedule-status ${schedule.status}">${schedule.status}</div>
            </div>
            <div class="schedule-details">
                <div class="schedule-detail">
                    <strong>Date:</strong> ${new Date(schedule.date).toLocaleDateString()}
                </div>
                <div class="schedule-detail">
                    <strong>Time:</strong> ${schedule.time}
                </div>
                <div class="schedule-detail">
                    <strong>Areas:</strong> ${schedule.areas ? schedule.areas.join(', ') : 'All areas'}
                </div>
                ${schedule.notes ? `
                    <div class="schedule-detail">
                        <strong>Notes:</strong> ${schedule.notes}
                    </div>
                ` : ''}
            </div>
            <div class="schedule-actions">
                <button class="btn-small btn-secondary" onclick="editSchedule('${schedule.id}')">Edit</button>
                <button class="btn-small btn-danger" onclick="deleteSchedule('${schedule.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load history
async function loadHistory() {
    const reports = await fetchReports();
    const historyList = document.getElementById('historyList');
    
    // Filter completed reports
    const completedReports = reports.filter(r => r.status === 'completed');
    
    if (completedReports.length === 0) {
        historyList.innerHTML = '<p>No completed collections found.</p>';
        return;
    }
    
    // Sort by completion date (newest first)
    const sortedReports = completedReports.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    
    historyList.innerHTML = sortedReports.map(report => `
        <div class="history-card">
            <div class="history-header">
                <div class="history-title">${report.wasteType} Collection</div>
                <div class="history-date">${new Date(report.completedDate).toLocaleDateString()}</div>
            </div>
            <div class="history-details">
                <div class="history-detail">
                    <strong>Resident:</strong> ${report.residentName}
                </div>
                <div class="history-detail">
                    <strong>Address:</strong> ${report.residentAddress}
                </div>
                <div class="history-detail">
                    <strong>Collector:</strong> ${report.assignedCollector || 'Not assigned'}
                </div>
                <div class="history-detail">
                    <strong>Report Date:</strong> ${new Date(report.reportDate).toLocaleDateString()}
                </div>
            </div>
        </div>
    `).join('');
}

// Filter functions
async function filterReports() {
    const searchTerm = document.getElementById('reportSearch').value.toLowerCase();
    const filterValue = document.getElementById('reportFilter').value;
    const reports = await fetchReports();
    
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
    const reportsList = document.getElementById('reportsList');
    
    if (filteredReports.length === 0) {
        reportsList.innerHTML = '<p>No reports found matching your criteria.</p>';
        return;
    }
    
    // Sort by report date (newest first)
    const sortedReports = filteredReports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
    
    reportsList.innerHTML = sortedReports.map(report => `
        <div class="report-card ${report.status}">
            <div class="report-header">
                <div class="report-title">${report.wasteType} Collection Report</div>
                <div class="report-status ${report.status}">${report.status}</div>
            </div>
            <div class="report-details">
                <div class="report-detail">
                    <strong>Resident:</strong> ${report.residentName}
                </div>
                <div class="report-detail">
                    <strong>Address:</strong> ${report.residentAddress}
                </div>
                <div class="report-detail">
                    <strong>Phone:</strong> ${report.residentPhone}
                </div>
                <div class="report-detail">
                    <strong>Urgency:</strong> ${report.urgency}
                </div>
                <div class="report-detail">
                    <strong>Report Date:</strong> ${new Date(report.reportDate).toLocaleDateString()}
                </div>
                ${report.scheduledDate ? `
                    <div class="report-detail">
                        <strong>Scheduled:</strong> ${new Date(report.scheduledDate).toLocaleDateString()}
                    </div>
                ` : ''}
                ${report.assignedCollector ? `
                    <div class="report-detail">
                        <strong>Collector:</strong> ${report.assignedCollector}
                    </div>
                ` : ''}
            </div>
            ${report.wasteDescription ? `
                <div class="report-description">
                    <strong>Description:</strong> ${report.wasteDescription}
                </div>
            ` : ''}
            <div class="report-actions">
                ${report.status === 'pending' ? `
                    <button class="btn-small btn-primary" onclick="scheduleReport('${report.id}')">Schedule</button>
                ` : ''}
                ${report.status === 'scheduled' ? `
                    <button class="btn-small btn-success" onclick="completeReport('${report.id}')">Complete</button>
                ` : ''}
                <button class="btn-small btn-secondary" onclick="viewReportDetails('${report.id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

async function filterSchedule() {
    const filterDate = document.getElementById('scheduleDateFilter').value;
    if (!filterDate) {
        await loadSchedule();
        return;
    }
    
    const schedules = await fetchSchedules();
    const filteredSchedules = schedules.filter(schedule => schedule.date === filterDate);
    
    // Update display with filtered results
    const scheduleList = document.getElementById('scheduleList');
    
    if (filteredSchedules.length === 0) {
        scheduleList.innerHTML = '<p>No schedules found for the selected date.</p>';
        return;
    }
    
    scheduleList.innerHTML = filteredSchedules.map(schedule => `
        <div class="schedule-card ${schedule.status}">
            <div class="schedule-header">
                <div class="schedule-title">${schedule.type}</div>
                <div class="schedule-status ${schedule.status}">${schedule.status}</div>
            </div>
            <div class="schedule-details">
                <div class="schedule-detail">
                    <strong>Date:</strong> ${new Date(schedule.date).toLocaleDateString()}
                </div>
                <div class="schedule-detail">
                    <strong>Time:</strong> ${schedule.time}
                </div>
                <div class="schedule-detail">
                    <strong>Areas:</strong> ${schedule.areas ? schedule.areas.join(', ') : 'All areas'}
                </div>
                ${schedule.notes ? `
                    <div class="schedule-detail">
                        <strong>Notes:</strong> ${schedule.notes}
                    </div>
                ` : ''}
            </div>
            <div class="schedule-actions">
                <button class="btn-small btn-secondary" onclick="editSchedule('${schedule.id}')">Edit</button>
                <button class="btn-small btn-danger" onclick="deleteSchedule('${schedule.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function filterHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const filterValue = document.getElementById('historyFilter').value;
    const reports = await fetchReports();
    
    let filteredReports = reports.filter(r => r.status === 'completed');
    
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
        historyList.innerHTML = '<p>No history found matching your criteria.</p>';
        return;
    }
    
    // Sort by completion date (newest first)
    const sortedReports = filteredReports.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    
    historyList.innerHTML = sortedReports.map(report => `
        <div class="history-card">
            <div class="history-header">
                <div class="history-title">${report.wasteType} Collection</div>
                <div class="history-date">${new Date(report.completedDate).toLocaleDateString()}</div>
            </div>
            <div class="history-details">
                <div class="history-detail">
                    <strong>Resident:</strong> ${report.residentName}
                </div>
                <div class="history-detail">
                    <strong>Address:</strong> ${report.residentAddress}
                </div>
                <div class="history-detail">
                    <strong>Collector:</strong> ${report.assignedCollector || 'Not assigned'}
                </div>
                <div class="history-detail">
                    <strong>Report Date:</strong> ${new Date(report.reportDate).toLocaleDateString()}
                </div>
            </div>
        </div>
    `).join('');
}

// Action functions
async function scheduleReport(reportId) {
    // Open modal with hidden report id
    document.getElementById('scheduleReportId').value = reportId;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayInput = document.getElementById('scheduledDay');
    if (dayInput) {
        dayInput.min = 1;
        dayInput.max = daysInMonth;
        dayInput.value = '';
    }
    const collector = document.getElementById('collectorName');
    if (collector) collector.value = '';
    document.getElementById('scheduleReportModal').style.display = 'block';
}

async function completeReport(reportId) {
    if (confirm('Mark this collection as completed?')) {
        const reports = await fetchReports();
        const report = reports.find(r => r.id === reportId);
        
        if (report) {
            report.status = 'completed';
            report.completedDate = new Date().toISOString();
            
            await saveReports(reports);
            
            showAdminNotification('success', 'Collection Completed', 
                `Waste collection completed for ${report.residentName}`);
            
            await loadReports();
            await loadDashboardData();
            await loadHistory();
            
            // Notify user (in a real system, this would be server-side)
            if (window.opener && window.opener.ECollectUser) {
                window.opener.ECollectUser.showNotification('success', 'Collection Completed', 
                    'Your waste has been collected successfully.');
            }
        }
    }
}

function viewReportDetails(reportId) {
    const reports = getAllWasteReports();
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
        const html = `
            <div class="report-details">
                <div class="report-detail"><strong>ID:</strong> ${report.id}</div>
                <div class="report-detail"><strong>Resident:</strong> ${report.residentName}</div>
                <div class="report-detail"><strong>Address:</strong> ${report.residentAddress}</div>
                <div class="report-detail"><strong>Phone:</strong> ${report.residentPhone}</div>
                <div class="report-detail"><strong>Waste Type:</strong> ${report.wasteType}</div>
                <div class="report-detail"><strong>Urgency:</strong> ${report.urgency}</div>
                <div class="report-detail"><strong>Status:</strong> ${report.status}</div>
                <div class="report-detail"><strong>Report Date:</strong> ${new Date(report.reportDate).toLocaleDateString()}</div>
                ${report.scheduledDate ? `<div class="report-detail"><strong>Scheduled:</strong> ${new Date(report.scheduledDate).toLocaleDateString()}</div>` : ''}
                ${report.assignedCollector ? `<div class="report-detail"><strong>Collector:</strong> ${report.assignedCollector}</div>` : ''}
                ${report.completedDate ? `<div class="report-detail"><strong>Completed:</strong> ${new Date(report.completedDate).toLocaleDateString()}</div>` : ''}
                ${report.wasteDescription ? `<div class="report-description"><strong>Description:</strong> ${report.wasteDescription}</div>` : ''}
            </div>
        `;
        document.getElementById('reportDetailsContent').innerHTML = html;
        document.getElementById('reportDetailsModal').style.display = 'block';
    }
}

// Schedule management
function openScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'block';
}

async function addCollectionSchedule() {
    const scheduleData = {
        id: 'schedule-' + Date.now(),
        date: document.getElementById('scheduleDate').value,
        time: document.getElementById('scheduleTime').value,
        type: document.getElementById('scheduleType').value,
        areas: document.getElementById('scheduleAreas').value.split(',').map(area => area.trim()),
        notes: document.getElementById('scheduleNotes').value,
        status: 'scheduled',
        createdDate: new Date().toISOString()
    };
    
    const schedules = await fetchSchedules();
    schedules.push(scheduleData);
    await saveSchedules(schedules);
    
    showAdminNotification('success', 'Schedule Added', 
        `Collection schedule added for ${new Date(scheduleData.date).toLocaleDateString()}`);
    
    closeModal('scheduleModal');
    document.getElementById('scheduleForm').reset();
    await loadSchedule();
    await loadDashboardData();
}

function editSchedule(scheduleId) {
    const schedules = getAllSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (schedule) {
        document.getElementById('scheduleDate').value = schedule.date;
        document.getElementById('scheduleTime').value = schedule.time;
        document.getElementById('scheduleType').value = schedule.type;
        document.getElementById('scheduleAreas').value = schedule.areas.join(', ');
        document.getElementById('scheduleNotes').value = schedule.notes || '';
        
        openScheduleModal();
        
        // Update the form to edit mode
        document.getElementById('scheduleForm').onsubmit = function(e) {
            e.preventDefault();
            updateSchedule(scheduleId);
        };
    }
}

async function updateSchedule(scheduleId) {
    const schedules = await fetchSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (schedule) {
        schedule.date = document.getElementById('scheduleDate').value;
        schedule.time = document.getElementById('scheduleTime').value;
        schedule.type = document.getElementById('scheduleType').value;
        schedule.areas = document.getElementById('scheduleAreas').value.split(',').map(area => area.trim());
        schedule.notes = document.getElementById('scheduleNotes').value;
        
        await saveSchedules(schedules);
        
        showAdminNotification('success', 'Schedule Updated', 'Collection schedule updated successfully');
        
        closeModal('scheduleModal');
        document.getElementById('scheduleForm').reset();
        await loadSchedule();
    }
}

async function deleteSchedule(scheduleId) {
    if (confirm('Are you sure you want to delete this schedule?')) {
        const schedules = await fetchSchedules();
        const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
        
        await saveSchedules(updatedSchedules);
        
        showAdminNotification('success', 'Schedule Deleted', 'Collection schedule deleted successfully');
        
        await loadSchedule();
        await loadDashboardData();
    }
}

// Delete schedules by date
async function deleteSchedulesByDate() {
    const startDate = prompt('Enter start date (YYYY-MM-DD) or leave empty for today:');
    const endDate = prompt('Enter end date (YYYY-MM-DD) or leave empty for no end date:');
    
    if (!startDate) {
        showAdminNotification('warning', 'Invalid Input', 'Please enter a start date');
        return;
    }
    
    const schedules = await fetchSchedules();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date('2099-12-31');
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        showAdminNotification('error', 'Invalid Date', 'Please enter valid dates in YYYY-MM-DD format');
        return;
    }
    
    const schedulesToDelete = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= start && scheduleDate <= end;
    });
    
    if (schedulesToDelete.length === 0) {
        showAdminNotification('warning', 'No Schedules Found', 'No schedules found in the specified date range');
        return;
    }
    
    const scheduleList = schedulesToDelete.map(schedule => 
        `- ${schedule.type} on ${new Date(schedule.date).toLocaleDateString()} at ${schedule.time}`
    ).join('\n');
    
    const confirmMessage = `Are you sure you want to delete ${schedulesToDelete.length} collection schedules?\n\nThis will delete:\n${scheduleList}\n\nThis action cannot be undone!`;
    
    if (confirm(confirmMessage)) {
        const updatedSchedules = schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.date);
            return !(scheduleDate >= start && scheduleDate <= end);
        });
        await saveSchedules(updatedSchedules);
        
        showAdminNotification('success', 'Schedules Deleted', `${schedulesToDelete.length} collection schedules deleted successfully`);
        
        await loadSchedule();
        await loadDashboardData();
        
        // Notify users about schedule changes (in a real system, this would be server-side)
        if (window.opener && window.opener.ECollectUser) {
            window.opener.ECollectUser.showNotification('warning', 'Schedule Updated', 
                'Collection schedules have been updated. Please check the calendar for the latest information.');
        }
    }
}

// Bulk delete schedules
async function bulkDeleteSchedules() {
    const schedules = await fetchSchedules();
    
    if (schedules.length === 0) {
        showAdminNotification('warning', 'No Schedules', 'No schedules to delete');
        return;
    }
    
    const scheduleList = schedules.map(schedule => 
        `- ${schedule.type} on ${new Date(schedule.date).toLocaleDateString()} at ${schedule.time}`
    ).join('\n');
    
    const confirmMessage = `Are you sure you want to delete ALL ${schedules.length} collection schedules?\n\nThis will delete:\n${scheduleList}\n\nThis action cannot be undone!`;
    
    if (confirm(confirmMessage)) {
        // Clear all schedules
        await saveSchedules([]);
        
        showAdminNotification('success', 'All Schedules Deleted', `${schedules.length} collection schedules deleted successfully`);
        
        await loadSchedule();
        await loadDashboardData();
        
        // Notify users about schedule changes (in a real system, this would be server-side)
        if (window.opener && window.opener.ECollectUser) {
            window.opener.ECollectUser.showNotification('warning', 'Schedule Updated', 
                'Collection schedules have been updated. Please check the calendar for the latest information.');
        }
    }
}

// Notification management
function openNotificationModal() {
    document.getElementById('notificationModal').style.display = 'block';
}

function sendBulkNotification() {
    const title = document.getElementById('notificationTitle').value;
    const message = document.getElementById('notificationMessage').value;
    const type = document.getElementById('notificationType').value; // info | warning | success
    
    // Broadcast customizable notification to users
    try {
        const payload = {
            id: 'notif-' + Date.now(),
            type,
            title,
            message,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('broadcastNotification', JSON.stringify(payload));
        setTimeout(() => localStorage.removeItem('broadcastNotification'), 50);
    } catch (e) {
        console.warn('[E-Collect] Failed to broadcast custom notification.', e);
    }

    showAdminNotification('success', 'Notification Sent', 'Your notification was sent to all residents');
    closeModal('notificationModal');
    document.getElementById('notificationForm').reset();
}

// Utility functions
function getAllWasteReports() {
    return JSON.parse(localStorage.getItem('wasteReports') || '[]');
}

function getAllSchedules() {
    return JSON.parse(localStorage.getItem('collectionSchedules') || '[]');
}

async function refreshReports() {
    await loadReports();
}

async function refreshSchedule() {
    await loadSchedule();
}

function exportHistory() {
    const reports = getAllWasteReports().filter(r => r.status === 'completed');
    const dataStr = JSON.stringify(reports, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `collection_history_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAdminNotification('success', 'History Exported', 'Collection history exported successfully');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showAdminNotification(type, title, message) {
    const container = document.getElementById('adminNotificationContainer');
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

    // Publish to user in real-time via localStorage event (cross-tab)
    try {
        const payload = {
            id: 'notif-' + Date.now(),
            type,
            title,
            message,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('broadcastNotification', JSON.stringify(payload));
        // Clean up so StorageEvent also fires on next notification with same key
        setTimeout(() => localStorage.removeItem('broadcastNotification'), 50);
    } catch (e) {
        console.warn('[E-Collect] Failed to broadcast notification to users.', e);
    }
}

// Real-time updates
function startRealTimeUpdates() {
    // Check for updates every 10 seconds
    setInterval(() => {
        loadDashboardData();
    }, 10000);
    
    // Listen for new reports (in a real system, this would be WebSocket)
    setInterval(() => {
        const reports = getAllWasteReports();
        const newReports = reports.filter(r => {
            const reportDate = new Date(r.reportDate);
            const now = new Date();
            const diffMinutes = (now - reportDate) / (1000 * 60);
            return diffMinutes < 1; // Reports from the last minute
        });
        
        if (newReports.length > 0) {
            showAdminNotification('info', 'New Reports', `${newReports.length} new waste collection report(s) received`);
            loadDashboardData();
        }
    }, 30000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Database helpers: Firestore (via window.DB) with localStorage fallback
async function fetchReports() {
    try {
        if (window.DB && DB.getAllReports) {
            const data = await DB.getAllReports();
            // Keep local cache in sync
            localStorage.setItem('wasteReports', JSON.stringify(data));
            return data;
        }
    } catch (e) {
        console.warn('[E-Collect] Failed to fetch reports from DB, using localStorage.', e);
    }
    return getAllWasteReports();
}

async function fetchSchedules() {
    try {
        if (window.DB && DB.getAllSchedules) {
            const data = await DB.getAllSchedules();
            localStorage.setItem('collectionSchedules', JSON.stringify(data));
            return data;
        }
    } catch (e) {
        console.warn('[E-Collect] Failed to fetch schedules from DB, using localStorage.', e);
    }
    return getAllSchedules();
}

async function saveReports(reports) {
    localStorage.setItem('wasteReports', JSON.stringify(reports));
    try {
        if (window.DB && DB.setAllReports) {
            await DB.setAllReports(reports);
        }
    } catch (e) {
        console.warn('[E-Collect] Failed to save reports to DB. Data kept locally.', e);
    }
}

async function saveSchedules(schedules) {
    localStorage.setItem('collectionSchedules', JSON.stringify(schedules));
    try {
        if (window.DB && DB.setAllSchedules) {
            await DB.setAllSchedules(schedules);
        }
    } catch (e) {
        console.warn('[E-Collect] Failed to save schedules to DB. Data kept locally.', e);
    }
}