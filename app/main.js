/*
File: main.js
Description: the game logic, all about drawing the game
Author: Renjie Yao
Date created: 02/26/2023
*/

let socket; // socket itself
let gameStarted = false; // start signal, the start event sent from the server will set this to true
let wind; // the wind speed, from 5 - 30, can go any direction
let windMessage; // the message describe the wind
let currentPlayer; // the currentPlayer, i.e. 'me' in this socket, can be Player1 or Player2
let serverAllowedPlayer; // server send this to decide who should move next
let cannonImg; // cannon Image
const players = []; // all players in this game (Player1 and Player2)
const cannons = []; // two cannons
let projectile; // the projectile
let button; // the button to fire
let roomId; // roomId
let previousTime;
let currentTime;
let deltaTime; // time between each fresh, used to calculate the position of the projectile
let input; // input for velocity
let slider; // input for angle
let sliderText; // describe the angle and velocity
let textMessage; // used to show text
let projectilePositionMessage; // used to show projectile position
let message; // message that will send to server
let disconnected; // disconnected signal, once the opponent disconnect, another player will win unless he reconnects
const FACTOR = 3.1415926 / 180; // used to convert the angle


function preload() {
    cannonImg = loadImage('./images/cannon.svg');
}

function setup() {
    const canvas = createCanvas(2000, 1000);
    socket = io('http://localhost:3000');

    // listen to the event if a game starts
    socket.on("start", (data) => {
        // start the game
        gameStarted = true;
        roomId = data.roomId;
        wind = data.wind;
        if (wind > 0) {
            windMessage = new Text(width/2, 200, 25, `Wind is from left to right, speed is ${wind}`);
        } else {
            windMessage = new Text(width/2, 200, 25, `Wind is from right to left, speed is ${wind}`);
        }

        // Player1 moves first
        serverAllowedPlayer = data.serverAllowedPlayer;

        // initialize player
        players.push(data.player1);
        players.push(data.player2);
        
        // decide who is the player1/player2 in this socket
        if (socket.id == players[0]) {
            currentPlayer = "Player1";
        } else {
            currentPlayer = "Player2";
        }

        // initialize fire button
        button = new Button(1000, height - 300, 100, 80, "Fire!");

        // initialize cannons, player1 owns cannon1, player2 owns cannon2
        const cannon1 = new Cannon(500, height - 15, 50, 30, false);
        const cannon2 = new Cannon(1500, height - 15, 50, 30, true);
        cannons.push(cannon1);
        cannons.push(cannon2);

        // Change HTML text
        document.querySelector('h1').innerHTML = `Room${roomId} Ready to Play`;
        document.querySelector('#player1').innerHTML = `Player1: ${players[0]}`;
        document.querySelector('#player2').innerHTML = `Player2: ${players[1]}`;

        // create an input box
        input = createInput('');
        input.position(950, height - 240);
        input.value(122);

        // create slider
        slider = createSlider(0, 90, 20);
        slider.position(950, height - 260);

        previousTime = millis(); // set previousTime to current time
    });

    // listen to the event if a player fires
    socket.on("fire", (data) => {

        button.text = "Firing..."
        button.w = 180;

        // Create the projectile
        if (data.player == "Player1") {
            projectile = new Projectile(500, height - 15, 5, data.player);
        } else {
            projectile = new Projectile(1500, height - 15, 5, data.player);
        }

        projectile.startFire(data.v, data.angle * FACTOR);
    });

    // listen to the event if it's the nextTurn for another player
    socket.on("nextTurn", (data) => {
        button.text = "Fire!"
        button.w = 100;
        serverAllowedPlayer = data.player;
    });

    // listen to if the opponent disconnects
    socket.on("disconnected", () => {
        disconnected = true;
    })
}

function draw() {
    background(150);
    currentTime = millis();
    deltaTime = currentTime - previousTime;
    previousTime = currentTime;
    if (!gameStarted) {
        fill(255, 0, 0);
        textMessage = new Text(width / 2, height / 2, 32, "Waiting for another player to join...");
        textMessage.show();
    } else {
        // opponent disconnect
        if (disconnected) {
            background(0);
            fill(0, 0, 255);
            textMessage = new Text(width / 2, height / 2, 40, "Opponent disconnected, YOU WIN!");
            textMessage.show();
            noLoop();
            return;
        }
        // game started
        fill(255, 0, 0);
        windMessage.show();
        textMessage = new Text(width / 2, height / 2, 32, "Game started!");
        textMessage.show();
        sliderText = new Text(1000, height - 392, 20, `angle: ${slider.value()}, velocity: ${input.value()}`);
        sliderText.show();
        for (let cannon of cannons) {
            cannon.show();
        }

        button.show();
        if (projectilePositionMessage) {
            fill(255, 0, 0);
            projectilePositionMessage.show();
        }
        if (projectile) {
            projectile.show();
            projectile.update(deltaTime);
            if (projectile.x < 0 || projectile.x > width) {
                // Miss, switch turn
                projectilePositionMessage = new Text(width / 2, height / 2 + 400, 40, `Position: ${projectile.x.toFixed(0)} ${projectile.y.toFixed(0)}`);
                projectile = null;
                button.text = "Fire!"
                button.w = 100;
                message = {
                    player: currentPlayer
                }
                socket.emit("nextTurn", message);
            } else if (projectile.y >= height) {
                // projectile reached the ground
                if (projectile.x >= 470 && projectile.x <= 530) {
                    // hit on cannon1
                    background(0);
                    if (currentPlayer == "Player1") {
                        fill(255, 0, 0);
                        textMessage = new Text(width / 2, height / 2, 60, "YOU LOSE!");
                        textMessage.show();
                        noLoop();
                    } else {
                        fill(0, 0, 255);
                        textMessage = new Text(width / 2, height / 2, 60, "YOU WIN!");
                        textMessage.show();
                        noLoop();
                    }
                } else if (projectile.x >= 1470 && projectile.x <= 1530) {
                    // hit on cannon 2
                    background(0);
                    if (currentPlayer == "Player2") {
                        fill(255, 0, 0);
                        textMessage = new Text(width / 2, height / 2, 60, "YOU LOSE!");
                        textMessage.show();
                        noLoop();
                    } else {
                        fill(0, 0, 255);
                        textMessage = new Text(width / 2, height / 2, 60, "YOU WIN!");
                        textMessage.show();
                        noLoop();
                    }
                } else {
                    // didn't hit anything
                    projectilePositionMessage = new Text(width / 2, height / 2 + 400, 40, `Position: ${projectile.x.toFixed(0)} ${projectile.y.toFixed(0)}`);
                    projectile = null;
                    button.text = "Fire!"
                    button.w = 100;
                    message = {
                        player: currentPlayer
                    }
                    socket.emit("nextTurn", message);
                }

            }
        }
        
    }
}

function mousePressed() {
    if (button) {
        if (projectile && projectile.firing) {
            console.log("Cannot fire, a player is firing now!");
            return;
        }
        if (currentPlayer != serverAllowedPlayer) {
            console.log("It is not your turn now, please wait for your opponent.");
            return;
        }
        // check if the mouse is over the button
        if (mouseX > button.x - button.w / 2 && mouseX < button.x + button.w / 2 &&
            mouseY > button.y - button.h / 2 && mouseY < button.y + button.h / 2) {
            // handle the button click event here
            button.text = "Firing..."
            button.w = 180;
            
            // Create the projectile
            if (currentPlayer == "Player1") {
                projectile = new Projectile(500, height - 15, 5, currentPlayer);
            } else {
                projectile = new Projectile(1500, height - 15, 5, currentPlayer);
            }
            console.log(projectile);
            projectile.startFire(input.value(), slider.value() * FACTOR);
            
            const fireData = {
                v: input.value(),
                angle: slider.value(),
                player: currentPlayer
            }
            socket.emit("fire", fireData);
            
        }
    }
    
  }

