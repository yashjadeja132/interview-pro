// controllers/hrController.js
const User = require("../../models/User"); // Your HR mongoose model
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

// Add HR
exports.addHr = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const image = req.file ? req.file.filename : null;
        // Check if email already exists
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Email already exists" });
        }

    const hashedPassword = await bcrypt.hash(password,10 );

        const hr = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            image,
        });
        await hr.save();
        res.status(201).json({ message: "HR added successfully", hr });
    } catch (err) {
        console.log(err.message);
        res.status(500).json(
            { message: "Error adding HR", error: err.message });
    }
};

// Get all HRs
exports.getHrs = async (req, res) => {
    try {
        const hrs = await User.find({ role: "Hr" }).select("-password"); // password exclude
        res.status(200).json(hrs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching HRs", error: err.message });
    }
};

// Get single HR
exports.getHrById = async (req, res) => {
    try {
        const hr = await User.findById(req.params.id).select("-password");
        if (!hr) return res.status(404).json({ message: "HR not found" });
        res.status(200).json(hr);
    } catch (err) {
        res.status(500).json({ message: "Error fetching HR", error: err.message });
    }
};

// Edit HR
exports.editHr = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const hr = await User.findById(req.params.id);
        if (!hr) return res.status(404).json({ message: "HR not found" });

        // If new image uploaded, remove old one
        if (req.file) {
            if (hr.image) {
                const oldPath = path.join(__dirname, "../uploads", hr.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            hr.image = req.file.filename;
        }

        hr.name = name || hr.name;
        hr.email = email || hr.email;
        hr.phone = phone || hr.phone;

        await hr.save();
        res.status(200).json({ message: "HR updated successfully", hr });
    } catch (err) {
        res.status(500).json({ message: "Error updating HR", error: err.message });
    }
};

// Delete HR
exports.deleteHr = async (req, res) => {
    try {
        const hr = await User.findById(req.params.id);
        if (!hr) return res.status(404).json({ message: "HR not found" });

        // Remove image from server
        if (hr.image) {
            const oldPath = path.join(__dirname, "../uploads", hr.image);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        await hr.deleteOne();
        res.status(200).json({ message: "HR deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting HR", error: err.message });
    }
};
