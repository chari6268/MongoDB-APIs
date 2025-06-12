// in this file, we will handle the upload of mdb files and store them in the mongoose database
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const uploadRouter = express.Router();

// Define the storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the original file extension
  },
});
// Initialize multer with the defined storage
const upload = multer({ storage: storage });
// Define the schema for the uploaded files

const fileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  createdAt: { type: Date, default: Date.now },
});

const File = mongoose.model('File', fileSchema);

uploadRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    // Create a new file document
    const file = new File({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    // Save the file document to the database
    await file.save();
    res.status(200).json({ message: 'File uploaded successfully', file });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Internal server error');
  }
});
// Route to get all uploaded files
uploadRouter.get('/files', async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Internal server error');
  }
});
// Route to download a file by ID
uploadRouter.get('/files/:id/download', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }
    const filePath = path.join(__dirname, '../uploads', file.filename);
    res.download(filePath, file.originalname);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Internal server error');
  }
});
// Route to delete a file by ID
uploadRouter.delete('/files/:id', async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }
    const filePath = path.join(__dirname, '../uploads', file.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file from disk:', err);
      }
    });
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send('Internal server error');
  }
});
// Export the uploadRouter
module.exports = uploadRouter;