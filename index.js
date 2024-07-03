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

let masterServerData = {
  tickDelay: 150,
  seed: 1,
};

io.on("connection", (socket) => {
  console.log("➕ " + socket.id);
  socket.emit("connected", masterServerData);
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
    players[socket.id].room = socket.id;
    players[socket.id].host = true;
    socket.emit("joinData", socket.id);
  });

  socket.on("join", (roomId) => {
    console.log(socket.id+" is trying to join "+roomId);
    players[socket.id].room = roomId;
    io.to(roomId).emit("reqServerData",socket.id);
  });

  socket.on("sendServerData", (requester,serverData) => {
    console.log(serverData);
    io.to(requester).emit("joinData", serverData);
  });

  
});

setInterval(() => {
  for (let p in players) {
    emittingPlayers = {};
    for (let j in players) {
      if(players[p].room === players[j].room && players[p] != players[j]){
        emittingPlayers[j] = players[j];
        delete emittingPlayers[j].host;
        delete emittingPlayers[j].room;
      }
    }
    io.to(p).emit('playerData', emittingPlayers);
  }
}, masterServerData.tickDelay);

server.listen(3000, () => {
  console.log("✅ Server Online\nlistening on *:3000");
});
