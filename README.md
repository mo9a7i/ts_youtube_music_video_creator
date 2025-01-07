# Audio Visualization CLI

A command-line tool for generating audio visualization videos, inspired by and based on [Wave.js](https://github.com/foobar404/Wave.js).

## Features

- Multiple visualization presets (based on Wave.js animations)
- Hardware acceleration support (NVIDIA GPU)
- High-quality video output (up to 4K)
- Background image support
- Debug mode for development
- Progress tracking for both frame processing and encoding

## Installation

```bash
pnpm install
```

## Usage

```bash
pnpm start -i input.mp3 [options]
```

Example:

```bash
pnpm start -i input/audio.mp3 -o output.mp4 -f 30 -d 20 -p 1 -r 720p 
```

### Options

```
-i, --input <path>      Input audio file path (required)
-o, --output <path>     Output video file path (default: "output.mp4")
-r, --resolution <preset> Video resolution preset (default: "1080p")
-d, --duration <secs>   Duration to process in seconds (default: "10")
-f, --fps <number>      Frames per second (default: "15")
-p, --preset <preset>   Animation preset (0-3 or animation name) (default: "0")
--debug                 Enable debug mode (save frames and raw files)
--stream               Create streamable output that can be played while processing
```

### Animation Presets

- `0`: Triple Wave with gradient colors
- `1`: Cubes and Circles combination
- `2`: Glob with Shine effect
- `3`: Square with Arcs overlay

Individual animations are also available:
- `Arcs`
- `Circles`
- `Cubes`
- `Flower`
- `Glob`
- `Lines`
- `Shine`
- `Square`
- `Turntable`
- `Wave`

## Credits

This project is based on [Wave.js](https://github.com/foobar404/Wave.js) by foobar404. Key modifications include:

- Conversion to TypeScript
- CLI interface implementation
- FFmpeg integration for video output
- Hardware acceleration support
- Background image support
- Progress tracking
- Performance optimizations

## Technical Details

- Uses Node.js Web Audio API for audio processing
- Canvas for visualization rendering
- FFmpeg for video encoding
- Supports NVIDIA NVENC for hardware acceleration
- Implements efficient frame buffering
- Background compositing with alpha blending

## Development

Debug mode (`--debug`) will save:
- Raw frame data
- Key frame images (start, middle, end)
- All intermediate files

## Requirements

- Node.js 18+
- FFmpeg
- NVIDIA GPU (optional, for hardware acceleration) 

### Resolution Presets

- `360p`: SD (640x360)
- `480p`: SD (854x480)
- `720p`: HD (1280x720)
- `1080p`: Full HD (1920x1080)
- `1440p`: QHD (2560x1440)
- `2160p`: 4K UHD (3840x2160)
- `4320p`: 8K UHD (7680x4320) 