const mongoose = require("mongoose");

const loginTimeSchema = new mongoose.Schema({
    timeDurationForTest: {
        type: Number,
        required: true,
        min: 0,
        max: 120
    }
});

module.exports = mongoose.model("LoginTime", loginTimeSchema);