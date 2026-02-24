const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  
    // Theme / UI Settings
    darkMode: { type: Boolean, default: false },
    
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
