# Backend

Simple Express server that exposes a `/generate` endpoint to create a 9:16 portrait video from uploaded images, a title and a subtitle.

## Installation

```bash
npm install
```

## Usage

Start the server with:

```bash
npm start
```

Then send a `POST` request to `http://localhost:3001/generate` with form-data:

- `images`: one or several image files (max 10)
- `title`: text up to 40 characters
- `subtitle`: text up to 60 characters

The service returns the generated MP4 video.

FFmpeg must be installed and accessible in `$PATH`.
