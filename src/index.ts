//@ts-nocheck
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const app = express();

app.use(cors());

app.get('/', async (req, res) => {
  res.send('/convert');
});

app.get('/convert', async (req, res, next) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ message: 'Missing URL query parameter' });
    }
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ message: 'Invalid YouTube video URL' });
    }
    const video = ytdl(url, { quality: 'highestaudio' });
    const mp3Stream = ffmpeg(video)
      .format('mp3')
      .audioBitrate(128)
      .on('error', (err) => {
        console.error(err);
        next(err);
      })
      .on('end', () => {
        console.log('Conversion finished');
        res.end();
      });
    res.setHeader('Content-Type', 'audio/mpeg');
    mp3Stream.pipe(res);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(8000, () => {
  console.log('Server started on port 8000');
});
