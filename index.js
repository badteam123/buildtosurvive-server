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
  seed: 1
};

io.on("connection", (socket) => {
  console.log("➕ " + socket.id);
  socket.emit("connected", serverData);
  players.push({ pid: socket.id });
  socket.on("disconnect", () => {
    console.log("➖ " + socket.id);
    for (let i = 0; i < players.length; i++) {
      if (players[i].pid === socket.id) {
        io.emit("removePlayer", socket.id);
        players.splice(i, 1);
      }
    }
  });
  socket.on("myPlayerData", (data) => {
    let inArray = false;
    for (let i = 0; i < players.length; i++) {
      if (players[i].pid === socket.id) {
        players[i] = Object.assign(players[i], data);
        inArray = true;
        break;
      }
    }
    if (!inArray) {
      players.push(Object.assign(players[i], data));
    }
  });
});

setInterval(() => {
  for (let i = 0; i < players.length; i++) {
    var emittingPlayers = [];
    for (let j = 0; j < players.length; j++) {
      if (players[i].pid != players[j].pid && players[i].pos != undefined) {
        emittingPlayers.push(players[j]);
      }
    }
    io.to(players[i].pid).emit("playerData", emittingPlayers);
  }
}, serverData.tickDelay);

server.listen(3000, () => {
  console.log("listening on *:3000");
});


io.on("command",handleCommand);

function handleCommand(cmd,arg){
  console.log(cmd);
  switch(cmd){
    case "tickDelay":
      serverData.tickDelay = arg;
      break;
    case "seed":
      serverData.seed = arg;
      break;
  }
}