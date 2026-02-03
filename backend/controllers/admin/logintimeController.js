const LoginTime = require("../../models/logintime");


exports.setLoginTime = async (req, res) => {
    try {
        const { timeDurationForTest } = req.body;
        const loginTime = await LoginTime.findOneAndUpdate(
            {},
            { timeDurationForTest },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: loginTime });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to set login time" });
    }
};

exports.getLoginTime = async (req, res) => {
    try {
        const loginTime = await LoginTime.findOne();
        res.status(200).json({ success: true, data: loginTime });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch login time" });
    }
};

exports.updateLoginTime = async (req, res) => {
    try {
        const { timeDurationForTest } = req.body;
        const loginTime = await LoginTime.findOneAndUpdate(
            {},
            { timeDurationForTest },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: loginTime });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update login time" });
    }
};