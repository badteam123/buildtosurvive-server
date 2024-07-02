const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

var players = [];

let serverData = {
  tickDelay: 150,
  seed: 1,
};

io.on("connection", (socket) => {
  console.log("➕ " + socket.id);
  socket.emit("connected", serverData);
  players[socket.id] = {};

  socket.on("disconnect", () => {
    console.log("➖ " + socket.id);
    io.emit("removePlayer", socket.id);
    delete players[socket.id];
  });

  socket.on("myPlayerData", (data) => {
    players[socket.id] = Object.assign(players[socket.id],data);
  });

  socket.on("host", () => {
    console.log("New host: " + socket.id);
    players[socket.id].hosting = true;
    socket.emit("hostData", socket.id);
  });
});

setInterval(() => {
  for (let i in players) {
    var emittingPlayers = {};
    for (let j in players) {
      if (i != j) {
        emittingPlayers[j] = players[j];
        delete emittingPlayers[j].hosting;
      }
    }
    io.to(i).emit("playerData", emittingPlayers);
  }
}, serverData.tickDelay);

server.listen(3000, () => {
  console.log("✅ Server Online\nlistening on *:3000");
});
