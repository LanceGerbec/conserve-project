// utils/scheduledTasks.js
// Purpose: Scheduled tasks like auto-purging old logs

const cron = require('node-cron');
const DocumentAccessLog = require('../models/DocumentAccessLog');

// Run every week (Sunday at 2 AM)
const scheduleLogPurge = () => {
  cron.schedule('0 2 * * 0', async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

      const result = await DocumentAccessLog.deleteMany({
        timestamp: { $lt: cutoffDate },
        severity: 'INFO' // Only purge info logs, keep warnings/critical
      });

      console.log(`🧹 Auto-purged ${result.deletedCount} old log entries`);
    } catch (error) {
      console.error('Auto-purge error:', error);
    }
  });

  console.log('📅 Scheduled log purge task enabled (Weekly on Sunday 2 AM)');
};

module.exports = { scheduleLogPurge };