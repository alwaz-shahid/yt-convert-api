import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

const app = express();

// Enable CORS middleware
app.use(cors());

// API endpoint for converting YouTube videos to MP3
app.get('/convert', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = req.query.url as string;
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
        res.sendStatus(500);
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

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
