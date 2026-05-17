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
  try { 
    const tracks = await Track.find();
    res.json(tracks); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.post('/api/tracks', async (req, res) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: "اسم التراك ورابط الـ MP3 مطلوبين" });
    }
    const newTrack = new Track({ title, url });
    await newTrack.save();
    res.status(201).json(newTrack);
  } catch (err) { 
    res.status(400).json({ error: err.message }); 
  }
});

app.delete('/api/tracks/:id', async (req, res) => {
  try {
    await Track.findByIdAndDelete(req.params.id);
    res.json({ message: "Track deleted!" });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.get('/api/videos', async (req, res) => {
  try { 
    const videos = await Video.find();
    res.json(videos); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});


app.post('/api/videos', async (req, res) => {
  try {
    // 1. اختبار للـ Body: بنشوف الداتا اللي جاية من الفرونتد أصلاً
    console.log("=== داتا الفيديوهات اللي وصلت للسيرفر ===", req.body);

    const { title, videoId, youtubeId, url } = req.body;
    let myId = videoId || youtubeId || url;

    // 2. لو الداتا مجتش خالص من الفرونتد
    if (!title || !myId) {
      return res.status(400).json({ error: "❌ اختبار: الفرونتد مبعتش عنوان أو رابط أصلاً!" });
    }

    // 3. هنقصه يدوي وبسيط جداً بدون تعقيد
    if (myId.includes('v=')) myId = myId.split('v=')[1].split('&')[0];
    else if (myId.includes('youtu.be/')) myId = myId.split('youtu.be/')[1].split('?')[0];

    const thumbnail = `https://img.youtube.com/vi/${myId}/hqdefault.jpg`;
    
    // 4. محاولة الحفظ في المونجو
    const newVideo = new Video({ title, youtubeId: myId, thumbnail });
    await newVideo.save();

    // 5. رسالة نجاح واضحة جداً عشان نتأكد إن النسخة الجديدة اشتغلت
    res.status(201).json({ success: "🎉 مبروك يا موميا التعديل الجديد اشتغل وقفلنا اللعبة!", data: newVideo });

  } catch (err) { 
    // لو العيب من المونجو والداتابيز هيبان هنا فوراً بـ 400 ورسالة واضحة
    res.status(400).json({ error: "❌ المونجو رفضت تحفظ بسبب: " + err.message }); 
  }
});

app.delete('/api/videos/:id', async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted!" });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return res.json({ success: true, token: 'biko_fix_token_2026' });
    }
    return res.status(401).json({ message: 'البيانات غير صحيحة' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));