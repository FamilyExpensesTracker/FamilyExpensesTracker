# 🏠 Family Expense Tracker

A modern, multilingual family expense tracking web application with enhanced dashboard capabilities and custom date range analysis.

## 🔒 Privacy First - Your Data Stays Local

**🏠 100% Local Storage**: All your expense data is stored locally in your browser only - nothing is ever sent to or stored on any server. This ensures complete privacy of your financial information, but also means **you are responsible for backing up your data** to avoid loss if browser data is cleared or corrupted.

⚠️ **Important**: Export your data regularly using the 📤 export button to prevent data loss!

## 🌐 Demo

**[Try the Live Demo](https://familyexpensestracker.github.io/FamilyExpensesTracker/)**

## ✨ Features

### 🌍 Multilingual Support
- **English** 🇺🇸
- **French** 🇫🇷 (Français)
- **Japanese** 🇯🇵 (日本語)
- Auto-detection based on browser language
- Persistent language settings

### 💱 Multi-Currency Support
- **USD** ($) - US Dollar
- **EUR** (€) - Euro
- **JPY** (¥) - Japanese Yen
- Smart currency formatting based on locale
- Automatic currency selection based on language

### 📊 Enhanced Dashboard with Custom Date Range Analysis
The dashboard now supports flexible date filtering for detailed expense analysis:

- **Preset Periods**: Quick selection of 7 days, 30 days, 3 months, 6 months, 1 year, or all time
- **Custom Date Ranges**: Select specific start and end dates for precise analysis
- **Independent Chart Controls**: Each chart (Category & Family Member) has its own date range controls
- **Visual Feedback**: Clear indicators when custom ranges are applied
- **Smart Validation**: Prevents invalid date ranges with user-friendly error messages
- **Modern UX/UI**: Smooth animations, glassmorphism effects, and intuitive controls

### 📈 Interactive Charts
- **Expenses by Category**: Doughnut chart with custom date range filtering
- **Monthly Spending Trend**: Line chart displaying spending patterns over time
- **Spending by Family Member**: Bar chart with independent date range selection
- **Daily Spending**: Bar chart showing daily expenses for the last 30 days
- **Real-time Updates**: Charts update instantly when date ranges change
- **Loading States**: Visual feedback during chart updates

### 🎯 Core Functionality
- **Add Expenses**: Easy-to-use form for adding new expenses with categories, dates, and family member tracking
- **Dashboard**: Comprehensive overview with statistics and interactive charts
- **Expense History**: Complete list of all expenses with filtering options
- **Local Storage**: All data is stored in your browser - no server required
- **Import/Export**: JSON-based data backup and restore functionality with cross-app compatibility
- **Smart Filters**: Filter expenses by category, family member, or month
- **Confirmation Dialogs**: Safe expense deletion with confirmation prompts

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Glassmorphism Effects**: Modern frosted glass aesthetic
- **Smooth Animations**: Hover effects and transitions for better user experience
- **Accessibility**: Proper color contrast and keyboard navigation support
- **Visual Feedback**: Toast notifications for user actions
- **Loading States**: Professional loading indicators

## 🚀 Getting Started

### Option 1: Use Online (Recommended)
Simply visit the [live demo](https://familyexpensestracker.github.io/FamilyExpensesTracker/) and start tracking your expenses immediately!

### Option 2: Download and Run Locally
1. **Download the Source Code**:
   ```bash
   git clone https://github.com/FamilyExpensesTracker/FamilyExpensesTracker.git
   cd FamilyExpensesTracker
   ```

2. **Open the Application**:
   - Simply open `index.html` in your web browser
   - No installation or server setup required!

### Prerequisites
- A modern web browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- No additional software installation required

## 📱 Usage Guide

### Adding an Expense
1. Click on the **"Add Expense"** tab (default view)
2. Fill in the expense details:
   - **Amount**: Enter the expense amount (supports decimals)
   - **Description**: Brief description of the expense
   - **Category**: Select from 11 predefined categories
   - **Date**: Choose the expense date (defaults to today)
   - **Paid By**: Enter the family member's name
3. Click **"Add Expense"** to save

### Exploring the Dashboard
1. Click on the **"Dashboard"** tab
2. View your spending statistics:
   - Current month total
   - Current year total
   - Total number of expenses
   - Average monthly spending
3. Interact with charts:
   - Use period selectors (7D, 30D, 3M, 6M, 1Y, All)
   - Set custom date ranges for precise analysis
   - Each chart has independent date controls

### Managing Expense History
1. Click on the **"History"** tab
2. View all expenses in chronological order (newest first)
3. Use powerful filters:
   - **Category Filter**: Show expenses from specific categories
   - **Member Filter**: Show expenses by specific family members
   - **Month Filter**: Show expenses from a specific month
4. Click **"Clear Filters"** to reset all filters
5. Delete expenses safely with confirmation dialogs

### Settings & Customization
1. Click the **⚙️** settings button in the header
2. **Language Settings**: Choose from English, French, or Japanese
3. **Currency Settings**: Select USD, EUR, or JPY
4. Settings are automatically saved and applied

### Data Management

#### Exporting Your Data
1. Click the **📤** export button in the header
2. A JSON file will be downloaded with all your expense data, settings, and metadata
3. Keep this file as a backup of your financial data

#### Importing Data
1. Click the **📥** import button in the header
2. Select a previously exported JSON file
3. The app supports:
   - Native format imports (perfect compatibility)
   - Cross-app imports with automatic format conversion
   - Duplicate detection and prevention
   - Settings migration (language & currency)

## 🗂️ Available Categories

- 🍕 **Food & Dining** - Restaurants, groceries, takeout
- 🚗 **Transportation** - Gas, public transport, rideshare
- 🛍️ **Shopping** - Clothing, electronics, general purchases
- 🎬 **Entertainment** - Movies, games, subscriptions
- 💡 **Bills & Utilities** - Electricity, water, internet, phone
- 🏥 **Healthcare** - Medical expenses, pharmacy, insurance
- 📚 **Education** - Books, courses, tuition
- ✈️ **Travel** - Flights, hotels, vacation expenses
- 💅 **Personal Care** - Haircuts, cosmetics, spa
- 🏡 **Home & Garden** - Rent, maintenance, furniture
- 📦 **Other** - Miscellaneous expenses

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup with modern features
- **CSS3**: Advanced styling with flexbox, grid, animations, and glassmorphism
- **Vanilla JavaScript ES6+**: No frameworks, pure modern JavaScript
- **Chart.js**: Beautiful, interactive charts and visualizations
- **Local Storage API**: Client-side data persistence
- **Flag Icons CSS**: Country flags for language selection

### Browser Compatibility
- **Chrome** 60+ ✅
- **Firefox** 55+ ✅
- **Safari** 12+ ✅
- **Edge** 79+ ✅
- **Mobile browsers** ✅

### Performance Features
- **Throttled Chart Rendering**: Prevents performance issues during rapid updates
- **Memory Management**: Automatic cleanup of chart instances
- **Responsive Images**: Optimized for all screen sizes
- **Efficient DOM Updates**: Minimal reflows and repaints

## 📊 Data Structure

The application uses a structured JSON format for data storage:

```json
{
  "expenses": [
    {
      "id": "1640995200000",
      "amount": 25.50,
      "description": "Grocery shopping",
      "category": "Food",
      "date": "2023-12-31",
      "paidBy": "John",
      "timestamp": "2023-12-31T18:00:00.000Z"
    }
  ],
  "language": "en",
  "currency": "USD",
  "exportDate": "2023-12-31T18:00:00.000Z",
  "version": "1.0"
}
```

## 🔒 Privacy & Security

- **100% Client-Side**: All data stays on your device
- **No Server Communication**: Zero data transmission to external servers
- **Local Storage Only**: Data is stored in your browser's secure local storage
- **No External Dependencies**: Except for Chart.js and Flag Icons CDN
- **Offline Capable**: Works without internet connection after initial load
- **No Tracking**: Zero analytics, cookies, or user tracking

## 🎨 Customization

### Adding New Categories
Edit the `index.html` file and add new `<option>` elements:

```html
<option value="Your Category">🎯 Your Category</option>
```

### Modifying Colors
Customize the color scheme in `styles.css`:
- **Primary**: `#667eea` (blue)
- **Secondary**: `#764ba2` (purple)
- **Background**: Linear gradient from primary to secondary

### Adding Languages
1. Add translations to the `translations` object in `app.js`
2. Add language option to the settings modal in `index.html`
3. Include appropriate flag icon from Flag Icons CSS

## 🤝 Contributing

We welcome contributions! Here are some ways you can help:

### Feature Suggestions
- Additional chart types (pie charts, scatter plots)
- New export formats (CSV, Excel, PDF)
- Recurring expense tracking
- Budget planning features
- Receipt photo attachments
- Multi-user family accounts

### Bug Reports
Please open an issue on GitHub with:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the **MIT License**.

## 🆘 Support & Troubleshooting

### Common Issues

**Charts not displaying?**
- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page

**Data not saving?**
- Make sure local storage is not disabled
- Check if you're in private/incognito mode
- Clear browser cache and try again

**Import/export not working?**
- Verify the JSON file format
- Ensure file size is reasonable (<10MB)
- Check browser permissions for file downloads

### Getting Help
- 📧 Open an issue on [GitHub](https://github.com/FamilyExpensesTracker/FamilyExpensesTracker/issues)
- 💬 Check existing issues for solutions
- 📖 Review this README for detailed usage instructions

### Data Recovery
- Always keep regular exports of your expense data
- Export before major browser updates
- Consider backing up to cloud storage for extra safety

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=FamilyExpensesTracker/FamilyExpensesTracker&type=Date)](https://star-history.com/#FamilyExpensesTracker/FamilyExpensesTracker&Date)

---

**Happy expense tracking! 💰📊**

*Made with ❤️ for families everywhere!*

## 👨‍💻 Author & Credits

**Main Author**: [Mounir IDRASSI](https://github.com/idrassi)  
**Created**: June 2025  
**Last Updated**: June 2025

### Acknowledgments
- Chart.js for beautiful data visualizations
- Flag Icons CSS for country flag icons
- The open-source community for inspiration and feedback

---
