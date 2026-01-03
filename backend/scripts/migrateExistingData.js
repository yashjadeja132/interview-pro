const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TestResult = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const CandidateTestProgress = require('../models/CandidateTestProgress');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateExistingData = async () => {
  try {
    console.log('Starting migration of existing test data...');

    // 1. Create TestAttempt records for existing TestResults
    console.log('Step 1: Creating TestAttempt records for existing TestResults...');
    const existingResults = await TestResult.find({ 
      testAttemptId: { $exists: false } 
    });

    console.log(`Found ${existingResults.length} existing test results to migrate`);

    for (const result of existingResults) {
      try {
        // Create TestAttempt record
        const attempt = new TestAttempt({
          candidateId: result.candidateId,
          positionId: result.positionId,
          attemptNumber: 1,
          status: 'completed',
          testResultId: result._id,
          startedAt: result.createdAt,
          completedAt: result.createdAt,
          isLatest: true
        });

        await attempt.save();

        // Update TestResult with attempt information
        result.attemptNumber = 1;
        result.testAttemptId = attempt._id;
        await result.save();

        console.log(`✓ Migrated TestResult ${result._id} -> TestAttempt ${attempt._id}`);
      } catch (error) {
        console.error(`✗ Error migrating TestResult ${result._id}:`, error.message);
      }
    }

    // 2. Handle existing CandidateTestProgress records
    console.log('Step 2: Handling existing CandidateTestProgress records...');
    const existingProgress = await CandidateTestProgress.find({ 
      attemptId: { $exists: false } 
    });

    console.log(`Found ${existingProgress.length} existing progress records`);

    for (const progress of existingProgress) {
      try {
        // Find or create a TestAttempt for this progress
        let attempt = await TestAttempt.findOne({
          candidateId: progress.candidateId,
          positionId: progress.positionId,
          status: 'in_progress'
        });

        if (!attempt) {
          // Create a new attempt for this progress
          attempt = new TestAttempt({
            candidateId: progress.candidateId,
            positionId: progress.positionId,
            attemptNumber: 1,
            status: 'in_progress',
            isLatest: true
          });
          await attempt.save();
        }

        // Update progress with attempt information
        progress.attemptId = attempt._id;
        progress.attemptNumber = attempt.attemptNumber;
        await progress.save();

        console.log(`✓ Migrated CandidateTestProgress ${progress._id} -> TestAttempt ${attempt._id}`);
      } catch (error) {
        console.error(`✗ Error migrating CandidateTestProgress ${progress._id}:`, error.message);
      }
    }

    // 3. Ensure only one latest attempt per candidate-position
    console.log('Step 3: Ensuring only one latest attempt per candidate-position...');
    const duplicateLatest = await TestAttempt.aggregate([
      {
        $match: { isLatest: true }
      },
      {
        $group: {
          _id: { candidateId: "$candidateId", positionId: "$positionId" },
          attempts: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    for (const duplicate of duplicateLatest) {
      // Keep the most recent attempt as latest, mark others as not latest
      const attempts = await TestAttempt.find({
        _id: { $in: duplicate.attempts }
      }).sort({ createdAt: -1 });

      if (attempts.length > 1) {
        // Mark all but the first (most recent) as not latest
        const idsToUpdate = attempts.slice(1).map(a => a._id);
        await TestAttempt.updateMany(
          { _id: { $in: idsToUpdate } },
          { isLatest: false }
        );
        console.log(`✓ Fixed duplicate latest attempts for candidate ${duplicate._id.candidateId}, position ${duplicate._id.positionId}`);
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log(`- Migrated ${existingResults.length} TestResult records`);
    console.log(`- Migrated ${existingProgress.length} CandidateTestProgress records`);
    console.log(`- Fixed ${duplicateLatest.length} duplicate latest attempts`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Rollback function (in case you need to undo the migration)
const rollbackMigration = async () => {
  try {
    console.log('Starting rollback of migration...');

    // Remove testAttemptId and attemptNumber from TestResults
    await TestResult.updateMany(
      { testAttemptId: { $exists: true } },
      { 
        $unset: { 
          testAttemptId: 1, 
          attemptNumber: 1 
        } 
      }
    );

    // Remove attemptId and attemptNumber from CandidateTestProgress
    await CandidateTestProgress.updateMany(
      { attemptId: { $exists: true } },
      { 
        $unset: { 
          attemptId: 1, 
          attemptNumber: 1 
        } 
      }
    );

    // Remove all TestAttempt records
    await TestAttempt.deleteMany({});

    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();

  const command = process.argv[2];
  
  if (command === 'rollback') {
    await rollbackMigration();
  } else {
    await migrateExistingData();
  }

  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

// Run the migration
if (require.main === module) {
  main().catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateExistingData, rollbackMigration };
