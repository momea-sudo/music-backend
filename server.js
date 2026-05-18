const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("🚨 تحذير قاتل: السيرفر مش شايف متغير MONGO_URI في الإعدادات!");
}

mongoose.connect(mongoURI)
  .then(() => console.log('🚀 تم الاتصال بنجاح بقاعدة بيانات MongoDB Atlas!'))
  .catch(err => {
    console.error('❌ فشل الاتصال بالمونجو:', err.message);
  });

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
    const { title, videoId, youtubeId, url } = req.body;
    
   
    let incomingUrl = videoId || youtubeId || url;

    if (!incomingUrl || !title) {
      return res.status(400).json({ error: "عنوان الفيديو والرابط مطلوبين" });
    }

    incomingUrl = incomingUrl.trim();
    let finalYoutubeId = "";

   
    if (incomingUrl.length === 11 && !incomingUrl.includes('/') && !incomingUrl.includes('.')) {
      
      finalYoutubeId = incomingUrl;
    } else {
    
      const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
      const match = incomingUrl.match(regExp);
      finalYoutubeId = (match && match[1].length === 11) ? match[1] : "";
    }

  
    if (!finalYoutubeId || finalYoutubeId.length !== 11) {
      return res.status(400).json({ error: "لم نتمكن من التعرف على كود الفيديو، تأكد من الرابط" });
    }

    const thumbnail = `https://img.youtube.com/vi/${finalYoutubeId}/hqdefault.jpg`;
    const newVideo = new Video({ title, youtubeId: finalYoutubeId, thumbnail });
    
    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (err) { 
    res.status(400).json({ error: err.message }); 
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