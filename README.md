# E-Collect Barangay Waste Collection System

A comprehensive web-based waste collection management system designed for barangay (village) administration to efficiently manage waste collection services for residents.

## 🌟 Features

### For Residents
- **Easy Registration**: Simple resident registration with contact information
- **Waste Collection Requests**: Submit waste collection requests with detailed information
- **Real-time Status Tracking**: Check the status of your collection requests using Request ID
- **Mobile-Friendly Interface**: Access the system from any device
- **Notification System**: Get real-time updates about your requests

### For Administrators
- **Dashboard Overview**: Comprehensive dashboard with statistics and recent activity
- **Request Management**: View, assign, and track all waste collection requests
- **Resident Management**: Manage registered residents and their information
- **Collection Scheduling**: Schedule and manage waste collection operations
- **Reports & Analytics**: Generate reports on collection statistics and trends
- **Data Export**: Export data in JSON format for backup and analysis

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser using localStorage

### Installation
1. Download all files to a local directory
2. Open `index.html` in your web browser
3. The system is ready to use!

### File Structure
```
E-collect/
├── index.html              # Main resident interface
├── admin-dashboard.html    # Administrator interface
├── style.css              # Main stylesheet
├── script.js              # Main JavaScript functionality
├── admin-script.js         # Admin dashboard functionality
├── notifications.js        # Notification system
├── logo.webp              # System logo
└── README.md              # This documentation
```

## 📱 Usage

### For Residents

#### 1. Registration
- Click "Request Collection" on the main page
- Fill out the registration form with your details
- Submit to register in the system

#### 2. Requesting Waste Collection
- After registration, you'll be redirected to the waste request form
- Select waste type (Biodegradable, Non-biodegradable, Recyclable, Hazardous)
- Enter quantity in kilograms
- Choose preferred collection date
- Add any additional notes
- Submit your request and receive a Request ID

#### 3. Checking Status
- Click "Check Status" on the main page
- Enter your Request ID
- View detailed status information

### For Administrators

#### 1. Dashboard
- View system statistics and recent activity
- Monitor pending requests and completed collections
- Track daily collection metrics

#### 2. Managing Requests
- View all waste collection requests
- Filter by status (Pending, Assigned, Completed)
- Assign collectors to pending requests
- Mark requests as completed

#### 3. Resident Management
- View all registered residents
- Search residents by name, address, or email
- Access resident contact information

#### 4. Collection Management
- Schedule new collections
- View all scheduled and completed collections
- Track collection performance

#### 5. Reports & Analytics
- View collection summaries
- Analyze waste type distribution
- Monitor monthly trends
- Export data for external analysis

## 🔧 Technical Details

### Data Storage
- Uses browser localStorage for data persistence
- No external database required
- Data persists between browser sessions
- Automatic data initialization on first use

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Data Structure
The system stores the following data types:
- **Residents**: Personal information and contact details
- **Waste Requests**: Collection requests with status tracking
- **Collections**: Scheduled and completed collection records
- **Notifications**: System notifications and alerts

## 📊 System Features

### Request Status Flow
1. **Pending**: Initial request submitted
2. **Assigned**: Collector assigned and scheduled
3. **Completed**: Collection finished

### Notification Types
- Request submitted confirmation
- Request assignment notification
- Collection completion notification
- Collection scheduling alerts
- Daily reminders for upcoming collections

### Export Capabilities
- Export residents data
- Export waste requests data
- Export collections data
- JSON format for easy integration

## 🎨 Customization

### Styling
- Modify `style.css` to change colors, fonts, and layout
- Responsive design for mobile and desktop
- Green color scheme representing environmental focus

### Functionality
- Extend JavaScript functions in `script.js` and `admin-script.js`
- Add new features by modifying the existing code structure
- Integrate with external APIs by modifying the data handling functions

## 🔒 Data Security

### Local Storage
- All data stored locally in browser
- No external data transmission
- Data remains on user's device
- Regular backups recommended via export feature

### Privacy
- No personal data sent to external servers
- Complete control over data by the barangay administration
- GDPR compliant data handling

## 🚀 Future Enhancements

### Potential Improvements
- SMS/Email notifications
- GPS tracking for collection routes
- Mobile app development
- Integration with external waste management systems
- Advanced analytics and reporting
- Multi-language support

### Scalability
- System designed for barangay-level usage
- Can be adapted for city-wide implementation
- Modular architecture allows easy feature additions

## 📞 Support

### Troubleshooting
- Clear browser cache if experiencing issues
- Ensure JavaScript is enabled
- Check browser console for error messages
- Verify all files are in the same directory

### Maintenance
- Regular data exports recommended
- Monitor localStorage usage
- Update browser for security patches
- Backup data before major updates

## 📄 License

This system is developed for barangay waste collection management. Please ensure compliance with local data protection regulations when implementing.

## 🤝 Contributing

To contribute to this project:
1. Identify areas for improvement
2. Test changes thoroughly
3. Maintain data integrity
4. Follow existing code structure
5. Document any new features

---

**E-Collect Barangay System** - Making waste collection management efficient and accessible for all communities.

