# What Was Said

Early version of a school project for the Poetics of Prompt Engineering class. 

Works with Blender 4.0.2 on MacOS.

## Installation

1. Install Tmux (assuming you have Homebrew) `brew install tmux`.
2. Run `npm install` in both the [site](/site/) and [server](/server/) folders.
3. Run `pip install -r requirements.txt` in the [generator/whisper](generator/whisper/) folder.
4. Update the `PATHS` object in [server/blenderToSite.js](/server/blenderToSite.js) to fit your system. (Paths must be absolute.)
5. Make `begin.sh` executable.

## Initializing a Session

`./begin.sh`

**NOTE : Site will be blank until the first update to generator/text/transcription.txt.**

## Gotchyas

- Your blend files must be saved in **Object Mode**.

## Credits
- Whisper implientation is a light edit of : https://github.com/davabase/whisper_real_time