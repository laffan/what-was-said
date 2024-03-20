const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const { blenderToSite, PATHS } = require("./functions/blenderToSite.js");

const app = express();
const server = http.createServer(app);
let timestamp = 0; // prevent model caching

// Initialize a ws server
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
  console.log("A new client connected.");
  ws.on("message", function incoming(message) {
    console.log("==MESSAGE RECEIVED ==");
    console.log(JSON.parse(message));
    sendToAllClients(message);
  });

  ws.on("close", () => console.log("Client disconnected"));
});

// Trigger model generation on text change
// If text changes, trigger a new model
fs.watch(
  `${PATHS.project}/${PATHS.generator.textDirectory}`,
  { encoding: "buffer" },
  (eventType, filename) => {
    timestamp = Date.now();
    console.log(`${filename} has been updated`);
    blenderToSite("SpiralTranscription", "transcription", timestamp);
  }
);

// When new model is created, tell the site.
fs.watch(`${PATHS.project}/${PATHS.site.modelDir}`, { encoding: "buffer" }, (eventType, filename) => {
  if (filename) {
    console.log(`File changed: ${filename}`);
    // Broadcast change to all clients after 1 second
    // (Takes a moment to register the new model)
    setTimeout(() => {
      sendToAllClients(filename.toString());
    }, 500);
  }
});

// Broadcast msg to everyone
function sendToAllClients(msg) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
