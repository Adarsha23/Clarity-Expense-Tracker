# Clarity Finance Tracker: Feature Walkthrough

The Clarity platform provides an intuitive and visually professional experience for financial tracking, featuring advanced analytics and smart forecasting.

## Core UI Refinements

### 🧼 Global Sidebar Navigation
- **Centralized Layout**: Extracted navigation into a reusable `Sidebar` component used across all pages.
- **Improved Workflow**: Easily switch between the **Overview** dashboard and the **Analytics** insights page.

### ⚡️ Real-time Feedback & UX
- **Toast Notifications**: Integrated `react-hot-toast` for instant feedback on CRUD operations.
- **Loading States**: Primary buttons show loading states during API requests.

### 🛠️ Edit Transaction Modal
- **High Contrast**: Black backgrounds and white text for all inputs.
- **Consistent Styling**: Styled buttons (Cancel: Danger, Save: Success) with standardized heights.

## Dashboard Overview

### 🍱 Integrated Category CTA
- Helper message and **"Add Custom"** link integrated directly below the category dropdown in the transaction form.

### 🧩 Category Management
- **Visual Separation**: Income and Expense categories are color-coded (Green/Red).
- **Default Badges**: Clear distinction for system default categories.

### 🔍 Transaction Filtering
- **Deep Search**: Filter transaction history by Category and Date Range (FROM/TO).
- **Filter Reset**: Quick "Clear" button for active filters.

## Dedicated Analytics Page

### 📊 Advanced Data Visualization
- **Monthly Filtered Pie Chart**: Select any specific month to view expense distribution. The chart title dynamically reflects the selected period (e.g., "Feb's Expense Distribution").
- **Savings Trend**: A line graph visualizing monthly savings over the last 6 months.

### 🔮 Smart Savings Projection (Zero-Income Runway)
- **Burn Rate Model**: Uses a **Trailing 30-Day Burn Rate** to calculate financial runway.
- **Runway Card**: Shows how many months your current savings will last if all income stopped today, with helpful tips for extension.

## Mobile Responsiveness
- The entire layout, including the sidebar and analytics grid, is fully responsive, adapting seamlessly from desktop to mobile views.
