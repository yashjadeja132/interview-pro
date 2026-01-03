const cron = require('node-cron');
const CandidateTestProgress = require ('../models/CandidateTestProgress');

const deleteOldProgress = cron.schedule("*/10 * * * *", async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 કલાક પહેલા
    console.log("Two hours ago:",twoHoursAgo.toISOString());
  console.log("Deleting old test progress records");
    try {
      const result = await CandidateTestProgress.deleteMany({
        lastSavedAt: { $lt: twoHoursAgo },
      });
  
      if (result.deletedCount > 0) {
        console.log(`🧹 ${result.deletedCount} old test progress records deleted.`);
      }
    } catch (err) {
      console.error("❌ Error while deleting old test progress:", err.message);
    }
  });
  module.exports = {
    start: () => deleteOldProgress.start(),
    stop: () => deleteOldProgress.stop()
  };