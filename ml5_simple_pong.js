// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js

ml5_simple_pong_better.js - modified by Rolf W

- 3/14 - improve bounce math and game over logic
- 3/15 - add score, fix bounce math again
=== */

let video;
let poseNet;
let poses = [];
let enablePosenet = false;

const BALLSIZE = 12;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;

// pong state vars
let x; // ball
let y;

let vx = 3.0; // note always <5
let vy = 1.2; // note always <5

let leftPaddle; // paddle "y" positions
let rightPaddle;

const LEFT_PLAYER = 0;
const RIGHT_PLAYER = 1;

const MAX_SCORE = 3;
let leftScore = 0;
let rightScore = 0;
let gameState = 0; // 0 = paused, 1 = running, 2 = game over
let frameCounter = 0; // used to pause a running game


/***
function playerScored(player) {
  leftScore = 0;
  rightScore = 0;
} ***/


function resetGame(losingPlayer) {

  x = width / 2; // initial ball position
  y = height / 2;

  if (losingPlayer == LEFT_PLAYER) {
    vx = 3.0;
  } else {
    vx = -3.0;
  }
}


function setup() {
  createCanvas(480, 360);

  rectMode(CORNER); // for paddles, etc

  resetGame(0);


  if (enablePosenet) {
    video = createCapture(VIDEO);
    video.size(width, height);
    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function(results) {
      poses = results;
    });
    // Hide the video element, and just show the canvas
    video.hide();
  }
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {
  background(0);

  leftPaddle = mouseY;
  rightPaddle = mouseY;

  if (enablePosenet) {
    image(video, 0, 0, width, height);
    // We can call both functions to draw all keypoints 
    // and the skeletons
    drawKeypoints();
    //drawSkeleton();
  }

  // draw paddles and ball
  fill(255);
  leftTop = leftPaddle - PADDLE_HEIGHT / 2;
  rightTop = rightPaddle - PADDLE_HEIGHT / 2;
  rect(15, leftTop, PADDLE_WIDTH, PADDLE_HEIGHT);
  rect(width - 15 - PADDLE_WIDTH, rightTop, PADDLE_WIDTH, PADDLE_HEIGHT);

  if (gameState == 1) {
    ellipse(x, y, BALLSIZE);
  }

  // draw scores
  fill(0, 250, 250);
  textSize(20);
  textAlign(CENTER);
  text(leftScore, 20, 20);
  text(rightScore, width - 20, 20);


  // simulation
  if (gameState == 1) {

    // check if ball reached left side
    if (x < 5) {
      rightScore++; // right player scored
      gameState = 0;
      frameCounter = 30;
      resetGame(LEFT_PLAYER);

      if (rightScore >= MAX_SCORE) {
        //noLoop();
        gameState = 2;
      }
    }

    // then, check if within y range of left paddle
    if (y >= leftTop && y < leftTop + PADDLE_HEIGHT) {
      if ((x > (15 + PADDLE_WIDTH)) && (x < (15 + 5 + PADDLE_WIDTH))) {
        vx = -vx;
      }
    }


    if (x > (width - 5)) {
      leftScore++; // left player scored
      gameState = 0;
      frameCounter = 30;
      resetGame(RIGHT_PLAYER); // game over (right)

      if (leftScore >= MAX_SCORE) {
        //noLoop();
        gameState = 2;
      }
    }

    // check if within y range of right paddle
    if (y >= rightTop && y < rightTop + PADDLE_HEIGHT) {
      if (x < (width - (15 + PADDLE_WIDTH)) && (x > (width - (15 + 5 + PADDLE_WIDTH)))) {
        vx = -vx;
      }
    }

    // bounce off bottom and top walls
    if (y < BALLSIZE / 2) {
      vy = -vy;
    } else if (y >= (height - 1 - BALLSIZE / 2)) {
      vy = -vy;
    }

  }

  
  if (gameState == 1) {
    x += vx; // advance ball
    y += vy;
  } else if (gameState == 0) {
    frameCounter--;
    if (frameCounter <= 0) {
      gameState = 1;
    }
  } else {
    // game over!
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

/***
looking for pose.keypoints[i] with .part === "nose" ??
0: Object
score: 0.9997594952583313
part: "nose"
position: Object
x: 219.39218565475107
y: 172.95492816217168
***/

function mousePressed() {
  if (poses.length > 0) {
    let pose = poses[0].pose;
    if (pose.keypoints && (pose.keypoints.length > 0)) {
      //print(pose.keypoints);    // let's find the "nose" keypoint

      // let's find the "nose" position, which has x and y
      for (let j = 0; j < pose.keypoints.length; j++) {
        if (pose.keypoints[j].part === 'nose') {
          print("nose position: ");
          print(pose.keypoints[j].position);
          break;
        }
      }
    }
  }
}
