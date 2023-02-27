/*
File: index.js
Description: the server behavior, used to create a server and communicate with its clients
Author: Renjie Yao
Date created: 02/26/2023
*/


const express = require('express');
const http = require('http');

const app = express();
app.use(express.static('../app'));

const server = http.Server(app);
server.listen(3000);
console.log("Server started.");

const io = require('socket.io')(server, {
    cors: { origin: "*" }
});

/**
 * This implementation works as follows:

    If there is a waiting player, the new player joins the waiting player's room and the game starts.
    If there is no waiting player, the new player creates a new room and waits for another player to join.
    Once two players are in the same room, the game starts and a "start" event is emitted to both players.
    Data is only emitted to players in the same room.
    If a player disconnects, the remaining player automatically win unless the player reconnects.
 */

// Keep track of connected players
const players = {};
// Keep track of waiting player
let waitingPlayer = null;
// Keep track of disconnected players
const disconnectedPlayers = {};

// Assign each new connection to a waiting player or a new room
io.on("connection", (socket) => {
    let roomId;
    if (waitingPlayer) {
        // Join the waiting player's room and start the game
        roomId = waitingPlayer.roomId;
        socket.join(roomId);
        players[socket.id] = { roomId: roomId };
        players[waitingPlayer.id].opponentId = socket.id;
        players[socket.id].opponentId = waitingPlayer.id;
        let randomNum = Math.floor(Math.random() * (25 + 1)) + 5;
        let direction = Math.random() >= 0.5 ? 1 : -1;
        io.to(roomId).emit("start", {
            roomId: roomId,
            player1: waitingPlayer.id,
            player2: socket.id,
            serverAllowedPlayer: "Player1",
            wind: direction * randomNum
        });
        console.log(`A player is already waiting, join the room ${roomId}`);
        waitingPlayer = null;
    } else {
        // Create a new room and wait for another player to join
        roomId = getAvailableRoomId();
        socket.join(roomId);
        players[socket.id] = { roomId: roomId };
        waitingPlayer = { id: socket.id, roomId: roomId };
        console.log(`Create a new room for Player<${socket.id}>, roomId is ${roomId}`);
    }

    // one player started the fire, emit data only to players in the same room
    socket.on("fire", (data) => {
        const { roomId, opponentId } = players[socket.id];
        io.to(roomId).to(opponentId).emit("fire", data);
    });

    // one player finished his turn, now it is the next player's turn
    socket.on("nextTurn", (data) => {
        const { roomId, opponentId } = players[socket.id];
        if (data.player == "Player1") {
            data.player = "Player2";
        } else {
            data.player = "Player1";
        }
        io.to(roomId).to(opponentId).emit("nextTurn", data);
    });

    // one player disconnected
    socket.on("disconnect", () => {
        const player = players[socket.id];
        if (player.opponentId) {
            io.to(player.roomId).to(player.opponentId).emit("disconnected");
            disconnectedPlayers[socket.id] = player.opponentId;
            // waitingPlayer = { id: player.opponentId, roomId: player.roomId };
        }

        if (waitingPlayer && waitingPlayer.id == socket.id) {
            waitingPlayer = null;
        }
        delete players[socket.id];
    });
});

// Helper function to get an available room ID from 1000 ~ 9999
function getAvailableRoomId() {
    const rooms = Object.keys(io.sockets.adapter.rooms);
    let roomId = "";
    do {
        roomId = Math.floor(Math.random() * 9000) + 1000;
    } while (rooms.includes(roomId.toString()));
    return roomId.toString();
}