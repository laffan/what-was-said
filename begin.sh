#!/bin/bash



SESSION_NAME="WWS"
tmux new-session -d -s "$SESSION_NAME"

tmux set -g pane-border-format " #{pane_index} - #{pane_title} "

# Create grid
tmux split-window -h
tmux select-pane -t 0
tmux split-window -v
tmux select-pane -t 2
tmux split-window -v

# Fill er up
tmux select-pane -t 0 -T 'Server'
tmux send-keys -t "$SESSION_NAME":0.0 "cd server; node server.js" C-m

tmux select-pane -t 1 -T 'Site'
tmux send-keys -t "$SESSION_NAME":0.1 "cd site; yarn dev" C-m

tmux select-pane -t 2 -T 'Whisper'
tmux send-keys -t "$SESSION_NAME":0.2 "cd generator/whisper; python3 whisperTranscribe.py" C-m

tmux select-pane -t 3 -T 'Shell'
tmux send-keys -t "$SESSION_NAME":0.3 "clear" C-m

tmux attach-session -t "$SESSION_NAME"
