# Frontend Setup Guide for Multiple Test Attempts

## 🚀 Quick Start

### 1. New Components Added
- ✅ **`TestAttemptManager.jsx`** - Manages multiple test attempts
- ✅ **`QuizTestWithAttempts.jsx`** - Updated quiz component with attempt support
- ✅ **`CandidateDashboardWithAttempts.jsx`** - Enhanced dashboard
- ✅ **`ThankYouWithAttempts.jsx`** - Results page with attempt history
- ✅ **`testAttemptService.js`** - API service for attempt management

### 2. Integration Steps

#### Step 1: Add New Routes
Add these routes to your main App.jsx or routing configuration:

```javascript
// Add these imports
import TestAttemptManager from './components/TestAttemptManager';
import QuizTestWithAttempts from './pages/candidate/QuizTestWithAttempts';
import CandidateDashboardWithAttempts from './pages/candidate/CandidateDashboardWithAttempts';
import ThankYouWithAttempts from './pages/candidate/ThankYouWithAttempts';

// Add these routes
<Route path="/quiz-test-with-attempts" element={<QuizTestWithAttempts />} />
<Route path="/candidate-dashboard-with-attempts" element={<CandidateDashboardWithAttempts />} />
<Route path="/thank-you-with-attempts" element={<ThankYouWithAttempts />} />
```

#### Step 2: Update Existing Components (Optional)
You can gradually migrate existing components to use the new attempt system:

```javascript
// In your existing candidate dashboard
import TestAttemptManager from '../components/TestAttemptManager';

// Replace your existing test section with:
<TestAttemptManager
  candidateId={candidateData.id}
  positionId={candidateData.positionId}
  positionName={candidateData.position?.name}
  onStartTest={(attemptInfo) => {
    // Handle starting new test
    navigate('/quiz-test-with-attempts', { state: { attemptInfo } });
  }}
  onResumeTest={(attemptInfo) => {
    // Handle resuming test
    navigate('/quiz-test-with-attempts', { state: { attemptInfo } });
  }}
/>
```

## 📁 File Structure

```
frontend/src/
├── components/
│   └── TestAttemptManager.jsx          # NEW: Manages test attempts
├── pages/candidate/
│   ├── QuizTestWithAttempts.jsx        # NEW: Updated quiz with attempts
│   ├── CandidateDashboardWithAttempts.jsx # NEW: Enhanced dashboard
│   └── ThankYouWithAttempts.jsx        # NEW: Results with history
├── services/
│   └── testAttemptService.js           # NEW: API service functions
└── FRONTEND_SETUP_GUIDE.md            # This guide
```

## 🔧 Component Usage

### TestAttemptManager Component

```javascript
import TestAttemptManager from '../components/TestAttemptManager';

<TestAttemptManager
  candidateId="candidate_id_here"
  positionId="position_id_here"
  positionName="MERN Stack Developer"
  onStartTest={(attemptInfo) => {
    // Handle starting new test
    console.log('Starting test:', attemptInfo);
  }}
  onResumeTest={(attemptInfo) => {
    // Handle resuming test
    console.log('Resuming test:', attemptInfo);
  }}
/>
```

**Props:**
- `candidateId` (string, required) - Candidate's ID
- `positionId` (string, required) - Position ID
- `positionName` (string, optional) - Display name for position
- `onStartTest` (function, required) - Callback when starting new test
- `onResumeTest` (function, required) - Callback when resuming test

### API Service Usage

```javascript
import { testAttemptService, progressService } from '../services/testAttemptService';

// Create new attempt
const attempt = await testAttemptService.createTestAttempt(candidateId, positionId);

// Submit test with attempt tracking
const result = await testAttemptService.submitTestWithAttempt(testData, attemptInfo);

// Get all attempts
const attempts = await testAttemptService.getCandidateAttempts(candidateId, positionId);

// Save progress
await progressService.saveProgress(progressData);
```

## 🎯 Key Features

### 1. Multiple Attempt Support
- ✅ Candidates can take tests multiple times
- ✅ Each attempt is tracked separately
- ✅ Progress is saved per attempt
- ✅ Complete attempt history

### 2. Enhanced User Experience
- ✅ Visual attempt status indicators
- ✅ Progress saving with confirmation
- ✅ Resume incomplete attempts
- ✅ Attempt history display
- ✅ Performance analytics

### 3. Backward Compatibility
- ✅ Existing components continue to work
- ✅ Gradual migration possible
- ✅ Legacy API endpoints still supported

## 🔄 Migration Strategy

### Option 1: Gradual Migration (Recommended)
1. **Keep existing components** working as they are
2. **Add new components** alongside existing ones
3. **Update routes** to include new components
4. **Test thoroughly** before switching
5. **Gradually replace** old components

### Option 2: Complete Replacement
1. **Replace existing components** with new ones
2. **Update all routes** to use new components
3. **Test all functionality** thoroughly
4. **Deploy with confidence**

## 📱 Component Features

### TestAttemptManager Features:
- **Attempt History Display** - Shows all previous attempts
- **Status Indicators** - Visual status for each attempt
- **Latest Attempt Tracking** - Highlights current attempt
- **Create New Attempts** - Easy attempt creation
- **Resume Functionality** - Continue incomplete tests
- **Performance Stats** - Shows best scores and averages

### QuizTestWithAttempts Features:
- **Attempt-Aware Progress** - Saves progress per attempt
- **Resume Capability** - Continues from where left off
- **Enhanced Timer** - Shows time remaining
- **Progress Indicators** - Visual progress tracking
- **Auto-Save** - Automatic progress saving
- **Error Handling** - Better error management

### CandidateDashboardWithAttempts Features:
- **Comprehensive Stats** - Total attempts, best scores
- **Quick Actions** - Start new or resume attempts
- **Recent History** - Shows recent attempts
- **Performance Overview** - Visual performance metrics

### ThankYouWithAttempts Features:
- **Detailed Results** - Current, best, and average scores
- **Attempt Comparison** - Compare with previous attempts
- **Performance Messages** - Encouraging feedback
- **Quick Actions** - Take another attempt or go to dashboard

## 🎨 Styling and UI

### Design System
- **Consistent Colors** - Green for completed, yellow for in-progress, red for abandoned
- **Status Badges** - Clear visual indicators
- **Progress Bars** - Visual progress tracking
- **Icons** - Lucide React icons for consistency
- **Responsive Design** - Works on all screen sizes

### Color Scheme
```css
/* Status Colors */
.completed { background: #dcfce7; color: #166534; } /* Green */
.in-progress { background: #fef3c7; color: #92400e; } /* Yellow */
.abandoned { background: #fee2e2; color: #991b1b; } /* Red */

/* Score Colors */
.score-excellent { color: #059669; } /* Green for 80%+ */
.score-good { color: #d97706; } /* Yellow for 60-79% */
.score-poor { color: #dc2626; } /* Red for <60% */
```

## 🔧 Configuration

### Environment Variables
Make sure your `.env` file includes:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### API Base URL
Update `axiosInstance.js` if needed:
```javascript
// frontend/src/Api/axiosInstance.js
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  // ... other config
});
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create new test attempt
- [ ] Resume incomplete attempt
- [ ] Save progress automatically
- [ ] Submit test successfully
- [ ] View attempt history
- [ ] Compare scores across attempts
- [ ] Handle errors gracefully

### Test Scenarios
1. **First Time User** - No previous attempts
2. **Returning User** - Has previous attempts
3. **Incomplete Attempt** - Resume functionality
4. **Multiple Attempts** - Take test multiple times
5. **Error Handling** - Network errors, validation errors

## 🚀 Deployment

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build
npm run preview
```

### Production Considerations
- ✅ **API Endpoints** - Ensure backend is deployed
- ✅ **Environment Variables** - Set production API URLs
- ✅ **Error Handling** - Test error scenarios
- ✅ **Performance** - Optimize bundle size
- ✅ **Security** - Validate all inputs

## 🔍 Troubleshooting

### Common Issues

#### Issue: "Failed to create test attempt"
**Solution**: Check if backend is running and API endpoints are accessible

#### Issue: "Progress not saving"
**Solution**: Verify attemptId is being passed correctly

#### Issue: "Cannot resume test"
**Solution**: Check if attempt exists and is in 'in_progress' status

#### Issue: "Component not rendering"
**Solution**: Check imports and ensure all dependencies are installed

### Debug Mode
Enable debug logging:
```javascript
// In your components
console.log('Attempt Info:', attemptInfo);
console.log('Progress Data:', progressData);
```

## 📞 Support

### Getting Help
1. **Check Console** - Look for error messages
2. **Verify API** - Test backend endpoints
3. **Check Network** - Monitor API calls
4. **Review Logs** - Check browser console

### Best Practices
- ✅ **Error Boundaries** - Wrap components in error boundaries
- ✅ **Loading States** - Show loading indicators
- ✅ **Validation** - Validate all inputs
- ✅ **Accessibility** - Ensure keyboard navigation
- ✅ **Performance** - Optimize re-renders

## 🎯 Next Steps

1. **Test Components** - Thoroughly test all new components
2. **Update Routes** - Add new routes to your app
3. **Style Customization** - Adjust colors and styling as needed
4. **Add Features** - Extend with additional functionality
5. **Monitor Performance** - Track user interactions and performance

The frontend is now ready to support multiple test attempts with a rich, user-friendly interface! 🎉
