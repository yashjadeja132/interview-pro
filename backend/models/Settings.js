const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  
    // Theme / UI Settings
    darkMode: { type: Boolean, default: false },
    primaryColor: { type: String, default: '#1976d2' }, // default blue
    
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
