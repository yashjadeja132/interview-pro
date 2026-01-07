exports.saveRecording = async (req, res) => {
  try {
    const { candidateId, testId } = req.body;
    const file = req.files?.recording;
    if (!file) return res.status(400).json({ message: "No recording file" });

    const uploadPath = path.join(__dirname, "../uploads/", file.name);
    await file.mv(uploadPath);

    // Save metadata in DB
    const recording = new Recording({
      candidateId,
      testId,
      fileName: file.name,
      filePath: uploadPath
    });
    await recording.save();

    res.json({ success: true, message: "Recording saved", data: recording });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};