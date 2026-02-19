const Settings = require('../../models/Settings');

// GET /api/settings/:section? (optional query param to get specific section)
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Settings not found' });
        }
        // If client passes ?section=system etc., we can filter
        const { section } = req.query;
        if (section) {
            const allowed = ['system', 'email', 'interviewRules', 'theme', 'roles'];
            if (!allowed.includes(section)) {
                return res.status(400).json({ message: 'Invalid section' });
            }
            const data = {};
            switch (section) {
                case 'theme':
                    data.darkMode = settings.darkMode;
                    data.primaryColor = settings.primaryColor;
                    data.logoUrl = settings.logoUrl;
                    break;
                
                default:
                    break;
            }
            return res.json({ settings: data });
        }
        res.json({ settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
    try {
        const updates = req.body; // expect partial updates
        const settings = await Settings.findOneAndUpdate({}, updates, { new: true, upsert: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getSettings, updateSettings };
