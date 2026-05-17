const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/biko_music')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Track = mongoose.model('Track', new mongoose.Schema({ title: String, url: String }));
const Video = mongoose.model('Video', new mongoose.Schema({ title: String, youtubeId: String, thumbnail: String }));

app.get('/api/tracks', async (req, res) => {
  try { res.json(await Track.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tracks', async (req, res) => {
  try {
    const newTrack = new Track(req.body);
    await newTrack.save();
    res.status(201).json(newTrack);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/tracks/:id', async (req, res) => {
  try {
    await Track.findByIdAndDelete(req.params.id);
    res.json({ message: "Track deleted!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/videos', async (req, res) => {
  try { res.json(await Video.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/videos', async (req, res) => {
  try {
    const { title, youtubeId } = req.body;
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    const newVideo = new Video({ title, youtubeId, thumbnail });
    await newVideo.save();
    res.status(201).json(newVideo); // يرجع البيانات للفرونتد كاملة بـ الـ _id
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/videos/:id', async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email === adminEmail && password === adminPassword) {
    return res.json({ success: true, token: 'biko_fix_token_2026' });
  }
  return res.status(401).json({ message: 'البيانات غير صحيحة' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));