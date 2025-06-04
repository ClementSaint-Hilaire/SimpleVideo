const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3001;

const upload = multer({ dest: 'uploads/' });

// Helper to generate video command
function generateVideo(files, title, subtitle, outputPath, callback) {
  const tempDir = fs.mkdtempSync(path.join('tmp-', uuidv4()));
  const duration = 30; // seconds total
  const perImage = duration / files.length;
  let command = ffmpeg();

  files.forEach((file) => {
    command = command.addInput(file.path);
  });

  // Build filter complex for fades and overlay text
  const filter = [];
  files.forEach((file, index) => {
    const fadeIn = index === 0 ? 'fade=t=in:st=0:d=1' : `fade=t=in:st=${index*perImage}:d=1`;
    const fadeOut = `fade=t=out:st=${(index+1)*perImage-1}:d=1`;
    filter.push(`[${index}:v]scale=1080:1920,${fadeIn},${fadeOut}[v${index}]`);
  });
  const concatInputs = files.map((_, index) => `[v${index}]`).join('');
  filter.push(`${concatInputs}concat=n=${files.length}:v=1:a=0,format=yuv420p[v]`);
  filter.push(`[v]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${title.replace(/'/g,"\\'")}':fontsize=64:fontcolor=black:x=(w-text_w)/2:y=50`);
  filter.push(`[v]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${subtitle.replace(/'/g,"\\'")}':fontsize=48:fontcolor=black:x=(w-text_w)/2:y=h-100`);

  command
    .complexFilter(filter)
    .outputOptions(['-t ' + duration])
    .output(outputPath)
    .on('end', () => {
      files.forEach(f => fs.unlinkSync(f.path));
      fs.rmdirSync(tempDir, { recursive: true });
      callback(null);
    })
    .on('error', (err) => {
      callback(err);
    })
    .run();
}

app.post('/generate', upload.array('images', 10), (req, res) => {
  const title = req.body.title || '';
  const subtitle = req.body.subtitle || '';
  if (title.length > 40 || subtitle.length > 60) {
    return res.status(400).json({ error: 'Invalid title or subtitle length' });
  }
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded' });
  }
  const outName = `video-${uuidv4()}.mp4`;
  const outputPath = path.join(__dirname, outName);
  generateVideo(files, title, subtitle, outputPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Video generation failed' });
    }
    res.download(outputPath, outName, (err) => {
      fs.unlinkSync(outputPath);
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
