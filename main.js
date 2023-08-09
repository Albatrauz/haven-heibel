import './style.css'
import { db } from './firebase'
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js'; 
import Phaser from 'phaser';

const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1; // Months start at 0!
let dd = today.getDate();

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

const formattedToday = dd + '/' + mm + '/' + yyyy;

/**
 * 
 * Game configurations.
 * @name configurations
 */
const nameInputScene = new Phaser.Scene("NameInput");
const configurations = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        nameInputScene: nameInputScene,
    }
}

/**
 *  Game assets.
 *  @name assets
 */
const assets = {
    bird: {
        red: 'bird-red'
    },
    obstacle: {
        pipe: {
            green: {
                top: 'pipe-green-top',
                bottom: 'pipe-green-bottom'
            },
            red: {
                top: 'pipe-red-top',
                bottom: 'pipe-red-bottom'
            }
        }
    },
    scene: {
        width: 300,
        background: {
            day: 'background-day',
            night: 'background-night'
        },
        ground: 'ground',
        gameOver: 'game-over',
        restart: 'restart-button',
        messageInitial: 'message-initial',
        setName: 'set-name'
    },
    scoreboard: {
        width: 25,
        base: 'number',
        number0: 'number0',
        number1: 'number1',
        number2: 'number2',
        number3: 'number3',
        number4: 'number4',
        number5: 'number5',
        number6: 'number6',
        number7: 'number7',
        number8: 'number8',
        number9: 'number9'
    },
    animation: {
        bird: {
            red: {
                clapWings: 'red-clap-wings',
                stop: 'red-stop'
            }
        }
    }
}

// Game
/**
 * The main controller for the entire Phaser game.
 * @name game
 * @type {object}
 */
const game = new Phaser.Game(configurations)
/**
 * If it had happened a game over.
 * @type {boolean}
 */
let gameOver
/**
 * If the game has been started.
 * @type {boolean}
 */
let gameStarted
/**
 * Up button component.
 * @type {object}
 */
let upButton
/**
 * Restart button component.
 * @type {object}
 */
let restartButton
/**
 * Game over banner component.
 * @type {object}
 */
let gameOverBanner
/**
 * Message initial component.
 * @type {object}
 */
let messageInitial

let messageInitialImage
// Bird
/**
 * Player component.
 * @type {object}
 */
let player
/**
 * Bird name asset.
 * @type {string}
 */
let birdName
/**
 * Quantity frames to move up.
 * @type {number}
 */
let framesMoveUp
// Background
/**
 * Day background component.
 * @type {object}
 */
let backgroundDay
/**
 * Ground component.
 * @type {object}
 */
let ground
// pipes
/**
 * Pipes group component.
 * @type {object}
 */
let pipesGroup
/**
 * Gaps group component.
 * @type {object}
 */
let gapsGroup
/**
 * Counter till next pipes to be created.
 * @type {number}
 */
let nextPipes
/**
 * Current pipe asset.
 * @type {object}
 */
let currentPipe
// score variables
/**
 * Scoreboard group component.
 * @type {object}
 */
let scoreboardGroup
/**
 * Score counter.
 * @type {number}
 */
let score

let highScore

let playerName;

let submitButton;

/**
 *   Load the game assets.
 */
function preload() {
    // Backgrounds and ground
    this.load.image(assets.scene.background.day, '/background-day.jpg')
    this.load.spritesheet(assets.scene.ground, '/ground-sprite2.png', {
        frameWidth: window.innerWidth,
        frameHeight: 112
    })

    // Pipes
    this.load.image(assets.obstacle.pipe.green.top, '/pipe-green-top.png')
    this.load.image(assets.obstacle.pipe.green.bottom, '/pipe-green-bottom.png')
    this.load.image(assets.obstacle.pipe.red.top, '/pipe-red-top.png')
    this.load.image(assets.obstacle.pipe.red.bottom, '/pipe-red-bottom.png')

    // Start game
    this.load.image(assets.scene.messageInitial, '/message-initial2.png')

    // End game
    this.load.image(assets.scene.gameOver, '/gameover.png')
    this.load.image(assets.scene.restart, '/restart-button.png')

    // Birds
    this.load.spritesheet(assets.bird.red, '/boat-sprite.png', {
        frameWidth: 80,
        frameHeight: 67
    })

    // Numbers
    this.load.image(assets.scoreboard.number0, '/number0.png')
    this.load.image(assets.scoreboard.number1, '/number1.png')
    this.load.image(assets.scoreboard.number2, '/number2.png')
    this.load.image(assets.scoreboard.number3, '/number3.png')
    this.load.image(assets.scoreboard.number4, '/number4.png')
    this.load.image(assets.scoreboard.number5, '/number5.png')
    this.load.image(assets.scoreboard.number6, '/number6.png')
    this.load.image(assets.scoreboard.number7, '/number7.png')
    this.load.image(assets.scoreboard.number8, '/number8.png')
    this.load.image(assets.scoreboard.number9, '/number9.png')
}

/**
 *   Create the game objects (images, groups, sprites and animations).
 */
function create() {
    backgroundDay = this.add.image(0, 0, assets.scene.background.day)
    backgroundDay.setOrigin(0, 0);
    backgroundDay.setScale(window.innerWidth / backgroundDay.width, window.innerHeight / backgroundDay.height);

    gapsGroup = this.physics.add.group()
    pipesGroup = this.physics.add.group()
    scoreboardGroup = this.physics.add.staticGroup()

    ground = this.physics.add.sprite(assets.scene.width, window.innerHeight, assets.scene.ground)
    ground.setCollideWorldBounds(true)
    ground.setDepth(10)

    messageInitialImage = this.add.image(0, 250, assets.scene.messageInitial)
    messageInitialImage.setDepth(30)
    messageInitialImage.x = window.innerWidth / 2;
    messageInitialImage.visible = true

    let playedBefore = false;
    submitButton = this.add.text(0, 550, "Starten", {
        fontSize: "24px",
        fill: "#ffffff",
        font: "bold 24px Arial",
        backgroundColor: "rgba(93, 51, 49, 1)",
        borderRadius: "4px",
        padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        },
        resolution: 5,
    });
    submitButton.x = (window.innerWidth / 2) - (submitButton.width / 2);

    if (localStorage.getItem("name")) {
        console.log(localStorage.getItem("name"));
        playerName = localStorage.getItem("name");
        messageInitial = this.add.text(0, 425, `Welkom terug ${playerName}`, {
            fontSize: "26px",
            fill: "white",
            fontFamily: "Arial",
            fontStyle: "bold"
        });
        messageInitial.text = `Welkom terug ${playerName}`;
        messageInitial.x = (window.innerWidth / 2) - (messageInitial.width / 2);
        playedBefore = true;
    } else {
        messageInitial = this.add.text(0, 425, "Vul je naam in:", {
            fontSize: "32px",
            fill: "white",
            fontFamily: "Arial",
            fontStyle: "bold"
        });
        messageInitial.x = (window.innerWidth / 2) - (messageInitial.width / 2);
        // Create an HTML input element
        var input = document.createElement("input");
        input.type = "text";
        input.id = "nameInput";
        input.placeholder = "Voor en achternaam";
        input.style.width = "100px";
        input.style.height = "20px";
        input.style.fontSize = "16px";
        input.style.position = "absolute";
        input.style.top = "500px";
        input.style.left = "50%";
        input.style.transform = "translateX(-50%)";
        input.style.zIndex = "9999"
        input.style.width = '50vw'
        input.style.padding = '12px 20px'
        input.style.borderRadius = '4px'
        input.style.outline = 'none'
        input.style.border = 'none'
        input.style.backgroundColor = 'rgba(93, 51, 49, 1)'
        input.style.color = 'white'
    
        // Append the input element to the game's parent container
        var parentContainer = this.sys.game.canvas.parentNode;
        parentContainer.appendChild(input);
        localStorage.setItem("highScore", "0");
    }

    submitButton.visible = true;

    // Set the button as interactive and define its behavior
    submitButton.setInteractive();
    submitButton.on("pointerdown", function () {
        if (playedBefore) {
            submitButton.visible = false;
            messageInitial.setDepth(30)
            messageInitial.visible = false
            messageInitialImage.visible = false

            moveBird();
        
            backgroundDay.setInteractive();
            backgroundDay.on('pointerdown', moveBird)

        } else {
            playerName = document.getElementById("nameInput").value;
            const docRef = doc(db, 'users', playerName);
            getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    messageInitial.text = "Naam niet beschikbaar";
                    messageInitial.x = (window.innerWidth / 2) - (messageInitial.width / 2);
                    messageInitial.setColor('#ff0000');
                    return;
                } else {
                    parentContainer.removeChild(input);
                    submitButton.visible = false;
                    messageInitial.setDepth(30)
                    messageInitial.visible = false
                    messageInitialImage.visible = false

                    moveBird();
                
                    backgroundDay.setInteractive();
                    backgroundDay.on('pointerdown', moveBird)
                }
            })
        }
    });


    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)

    // Red Bird Animations
    this.anims.create({
        key: assets.animation.bird.red.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bird.red, {
            start: 0,
            end: 2,
            x: -20,
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bird.red.stop,
        frames: [{
            key: assets.bird.red,
            frame: 1
        }],
        frameRate: 20
    })

    prepareGame(this)

    gameOverBanner = this.add.image(0, 206, assets.scene.gameOver)
    gameOverBanner.x = window.innerWidth / 2;
    gameOverBanner.setDepth(20)
    gameOverBanner.visible = false

    restartButton = this.add.image(0, 300, assets.scene.restart).setInteractive()
    restartButton.x = window.innerWidth / 2;
    restartButton.on('pointerdown', restartGame)
    restartButton.setDepth(20)
    restartButton.visible = false
}

/**
 *  Update the scene frame by frame, responsible for move and rotate the bird and to create and move the pipes.
 */
function update() {
    if (gameOver || !gameStarted)
        return

    if (framesMoveUp > 0)
        framesMoveUp--
    else if (Phaser.Input.Keyboard.JustDown(upButton))
        moveBird()
    else {
        player.setVelocityY(120)

        if (player.angle < 90)
            player.angle += 1
    }

    pipesGroup.children.iterate(function (child) {
        if (child == undefined)
            return

        if (child.x < -50)
            child.destroy()
        else
            child.setVelocityX(-100)
    })

    gapsGroup.children.iterate(function (child) {
        child.body.setVelocityX(-100)
    })

    nextPipes++
    if (nextPipes === 130) {
        makePipes(game.scene.scenes[0])
        nextPipes = 0
    }
}

/**
 *  Bird collision event.
 *  @param {object} player - Game object that collided, in this case the bird. 
 */
function hitBird(player) {
    this.physics.pause()

    gameOver = true
    gameStarted = false

    player.anims.play(getAnimationBird(birdName).stop)

    gameOverBanner.visible = true
    restartButton.visible = true
}

/**
 *   Update the scoreboard.
 *   @param {object} _ - Game object that overlapped, in this case the bird (ignored).
 *   @param {object} gap - Game object that was overlapped, in this case the gap.
 */
function updateScore(_, gap) {
    score++
    gap.destroy()

    if (score % 10 == 0) {
        if (currentPipe === assets.obstacle.pipe.green)
            currentPipe = assets.obstacle.pipe.red
        else
            currentPipe = assets.obstacle.pipe.green
    }
    updateScoreboard()
}

/**
 * Create pipes and gap in the game.
 * @param {object} scene - Game scene.
 */
function makePipes(scene) {
    if (!gameStarted || gameOver) return

    const pipeTopY = Phaser.Math.Between(-100, 150)
    const middleOfGap = window.innerWidth;

    const gap = scene.add.line(middleOfGap, pipeTopY + 275, 0, 0, 0, 230)
    gapsGroup.add(gap)
    gap.body.allowGravity = false
    gap.visible = true

    const pipeTop = pipesGroup.create(middleOfGap, pipeTopY, currentPipe.top)
    pipeTop.body.allowGravity = false

    const pipeBottom = pipesGroup.create(middleOfGap, pipeTopY + 550, currentPipe.bottom)
    pipeBottom.body.allowGravity = false
}

/**
 * Move the bird in the screen.
 */
function moveBird() {
    if (gameOver)
        return

    if (!gameStarted)
        startGame(game.scene.scenes[0])

    player.setVelocityY(-400)
    player.angle = -15
    framesMoveUp = 3
}


/**
 * Get the animation name from the bird.
 * @param {string} birdColor - Game bird color asset.
 * @return {object} - Bird animation asset.
 */
function getAnimationBird() {
    return assets.animation.bird.red
}

/**
 * Update the game scoreboard.
 */
function updateScoreboard() {
    scoreboardGroup.clear(true, true)

    const scoreAsString = score.toString()
    localStorage.setItem("score", scoreAsString);
    localStorage.setItem("name", playerName);
    checkHighScore(score);
    // const savedScore = localStorage.getItem("score");

    // If statement to render the scoreboard
    if (scoreAsString.length == 1)
        scoreboardGroup.create((window.innerWidth / 2 - assets.scoreboard.width / 2), 120, assets.scoreboard.base + score).setDepth(10)
    else {
        let initialPosition = (window.innerWidth / 2 - assets.scoreboard.width / 2) - ((score.toString().length * assets.scoreboard.width) / 2)

        for (let i = 0; i < scoreAsString.length; i++) {
            scoreboardGroup.create(initialPosition, 120, assets.scoreboard.base + scoreAsString[i]).setDepth(10)
            initialPosition += assets.scoreboard.width
        }
    }
}
const scoreToDatabase = (score) => {
    let dbToWrite = doc(db, 'users', playerName);
    setDoc(dbToWrite, { score: score, date: formattedToday })
}

const checkHighScore = (score) => {
    if (score > localStorage.getItem("highScore")) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        scoreToDatabase(score);
    }
}


/**
 * Restart the game. 
 * Clean all groups, hide game over objects and stop game physics.
 */
function restartGame() {
    pipesGroup.clear(true, true)
    pipesGroup.clear(true, true)
    gapsGroup.clear(true, true)
    scoreboardGroup.clear(true, true)
    player.destroy()
    gameOverBanner.visible = false
    restartButton.visible = false
    messageInitialImage.visible = true
    submitButton.visible = true

    const gameScene = game.scene.scenes[0]
    prepareGame(gameScene)

    gameScene.physics.resume()
}

/**
 * Restart all variable and configurations, show main and recreate the bird.
 * @param {object} scene - Game scene.
 */
function prepareGame(scene) {
    framesMoveUp = 0
    nextPipes = 0
    currentPipe = assets.obstacle.pipe.green
    score = 0
    gameOver = false
    backgroundDay.visible = true
    messageInitial.visible = true

    birdName = 'red'
    player = scene.physics.add.sprite(60, 265, birdName);

    player.body.setSize(80, 80);
    
    // Update the physics body position to match the sprite's position
    player.body.position.x = player.x;
    player.body.position.y = player.y;
    // player.x = -20;
    player.setCollideWorldBounds(true)
    player.anims.play(getAnimationBird(birdName).clapWings, true)
    player.body.allowGravity = false

    scene.physics.add.collider(player, ground, hitBird, null, scene)
    scene.physics.add.collider(player, pipesGroup, hitBird, null, scene)

    scene.physics.add.overlap(player, gapsGroup, updateScore, null, scene)
}

/**
 * Start the game, create pipes and hide the main menu.
 * @param {object} scene - Game scene.
 */
function startGame(scene) {
    gameStarted = true
    messageInitial.visible = false

    const score0 = scoreboardGroup.create(200, 120, assets.scoreboard.number0)
    score0.setDepth(20)

    makePipes(scene)
}