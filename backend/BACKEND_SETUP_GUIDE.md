# Backend Setup Guide for Multiple Test Attempts

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install axios form-data  # For testing scripts
```

### 2. Run Database Migration
```bash
# Migrate existing data to support multiple attempts
node scripts/migrateExistingData.js

# If you need to rollback (undo the migration)
node scripts/migrateExistingData.js rollback
```

### 3. Start the Server
```bash
npm start
# or
node server.js
```

### 4. Test the API Endpoints
```bash
# Update the test script with your actual candidate and position IDs
node scripts/testEndpoints.js
```

## 📁 New Files Added

### Models
- `models/TestAttempt.js` - Tracks individual test attempts

### Controllers
- `controllers/test/testAttemptController.js` - Handles multiple test attempts

### Routes
- `routes/test/testAttemptRoutes.js` - API endpoints for attempt management

### Scripts
- `scripts/migrateExistingData.js` - Migrates existing data
- `scripts/testEndpoints.js` - Tests all new endpoints

## 🔧 Modified Files

### Models
- `models/Test.js` - Added attempt tracking fields
- `models/CandidateTestProgress.js` - Added attempt tracking fields

### Controllers
- `controllers/testProgress/testProgressController.js` - Updated for attempt support

### Routes
- `routes/testProgres/testProgressRoutes.js` - Updated route parameters
- `server.js` - Added new route registration

## 🌐 New API Endpoints

### Test Attempt Management
```
POST   /api/test-attempt/create                    - Create new test attempt
POST   /api/test-attempt/submit                    - Submit test with attempt tracking
GET    /api/test-attempt/candidate/:id/position/:id - Get all attempts for candidate-position
GET    /api/test-attempt/latest/:id/position/:id    - Get latest attempt
GET    /api/test-attempt/results                   - Get all results with attempt info
```

### Updated Progress Management
```
POST   /api/test-progress/save                     - Save progress (updated for attempts)
GET    /api/test-progress/get/:attemptId           - Get progress by attempt ID
DELETE /api/test-progress/reset                    - Reset progress (updated for attempts)
```

## 📊 Database Schema Changes

### TestAttempt Collection (New)
```javascript
{
  _id: ObjectId,
  candidateId: ObjectId,     // Reference to Candidate
  positionId: ObjectId,      // Reference to Position
  attemptNumber: Number,     // 1, 2, 3, etc.
  status: String,           // 'in_progress', 'completed', 'abandoned'
  testResultId: ObjectId,   // Reference to TestResult when completed
  startedAt: Date,
  completedAt: Date,
  isLatest: Boolean,        // True for most recent attempt
  createdAt: Date,
  updatedAt: Date
}
```

### TestResult Collection (Updated)
```javascript
{
  // ... existing fields ...
  attemptNumber: Number,     // NEW: Which attempt this result belongs to
  testAttemptId: ObjectId,   // NEW: Reference to TestAttempt
}
```

### CandidateTestProgress Collection (Updated)
```javascript
{
  // ... existing fields ...
  attemptId: ObjectId,       // NEW: Reference to specific attempt
  attemptNumber: Number,     // NEW: For easy reference
}
```

## 🔄 Migration Process

### What the Migration Does:
1. **Creates TestAttempt records** for all existing TestResults
2. **Updates TestResult records** with attempt information
3. **Handles existing progress records** by creating corresponding attempts
4. **Ensures data integrity** by fixing duplicate latest attempts

### Migration Safety:
- ✅ **Non-destructive** - Original data is preserved
- ✅ **Reversible** - Can be rolled back if needed
- ✅ **Idempotent** - Can be run multiple times safely
- ✅ **Backward compatible** - Old API endpoints still work

## 🧪 Testing

### Manual Testing
1. **Create Test Attempt**:
   ```bash
   curl -X POST http://localhost:5000/api/test-attempt/create \
     -H "Content-Type: application/json" \
     -d '{"candidateId":"YOUR_CANDIDATE_ID","positionId":"YOUR_POSITION_ID"}'
   ```

2. **Get Latest Attempt**:
   ```bash
   curl http://localhost:5000/api/test-attempt/latest/YOUR_CANDIDATE_ID/YOUR_POSITION_ID
   ```

3. **Get All Attempts**:
   ```bash
   curl http://localhost:5000/api/test-attempt/candidate/YOUR_CANDIDATE_ID/position/YOUR_POSITION_ID
   ```

### Automated Testing
```bash
# Update test script with your actual IDs
node scripts/testEndpoints.js
```

## 🔍 Monitoring and Debugging

### Check Migration Status
```javascript
// In MongoDB shell or through your app
db.testattempts.countDocuments()  // Should show number of attempts created
db.testresults.countDocuments({ testAttemptId: { $exists: true } })  // Should show migrated results
```

### Common Issues and Solutions

#### Issue: "Test already submitted" error
**Solution**: Use the new `/api/test-attempt/submit` endpoint instead of the old one

#### Issue: Progress not saving
**Solution**: Ensure you're passing `attemptId` and `attemptNumber` in the progress save request

#### Issue: Duplicate latest attempts
**Solution**: Run the migration script again - it will fix duplicates

## 🚦 Production Deployment

### Pre-deployment Checklist:
- [ ] Run migration script on staging environment
- [ ] Test all new endpoints thoroughly
- [ ] Verify existing functionality still works
- [ ] Update frontend to use new endpoints (optional)
- [ ] Monitor database performance with new indexes

### Deployment Steps:
1. **Deploy backend code** with new models and controllers
2. **Run migration script** on production database
3. **Verify endpoints** are working correctly
4. **Update frontend** to use new features (when ready)

## 📈 Performance Considerations

### Database Indexes Added:
- `{ candidateId: 1, positionId: 1, attemptNumber: 1 }` - Unique constraint
- `{ candidateId: 1, positionId: 1, isLatest: 1 }` - Fast latest attempt queries
- `{ attemptId: 1 }` - Unique progress per attempt

### Query Optimization:
- Latest attempt queries are optimized with indexes
- Progress queries use attemptId for fast lookups
- Results aggregation includes attempt information efficiently

## 🔐 Security Considerations

### Input Validation:
- All endpoints validate candidate and position IDs
- Attempt IDs are validated against candidate-position combinations
- File uploads are handled securely

### Access Control:
- Existing authentication middleware works with new endpoints
- Role-based access control is maintained
- No new security vulnerabilities introduced

## 📞 Support

### Troubleshooting:
1. Check server logs for detailed error messages
2. Verify database connection and permissions
3. Ensure all required environment variables are set
4. Test with the provided test scripts

### Rollback Plan:
If you need to rollback the changes:
```bash
node scripts/migrateExistingData.js rollback
```

This will:
- Remove attempt tracking from existing records
- Delete all TestAttempt records
- Restore original data structure

## 🎯 Next Steps

1. **Test the backend** thoroughly with the provided scripts
2. **Update frontend** to use new endpoints (when ready)
3. **Monitor performance** and optimize if needed
4. **Add additional features** like attempt limits or cooldown periods

The backend is now ready to support multiple test attempts! 🎉
