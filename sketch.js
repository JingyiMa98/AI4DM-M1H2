let digits = [];
let classifier, video, textLabel, label = "Waiting for the TM model...";
let modelUrl = "https://teachablemachine.withgoogle.com/models/6EIN47W1H/";
let handPose;
let hands = [];
let size = 100;
let isLocked = false; 
let lockedLabel = null;
let lockedColor = null; 
let lockStartTime = 0;  
let lockDuration = 4000;

function preload() {
  classifier = ml5.imageClassifier(modelUrl + 'model.json');
  handPose = ml5.handPose({flipped: true});
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide(); 

  textLabel = createP(label);
  textLabel.parent('modelLabel');

  classifier.classify(video, gotResult);
  handPose.detectStart(video, gotHands);
}

function draw() {
  background(0);
  textLabel.html(label);
  if (isLocked && millis() - lockStartTime > lockDuration) {
    isLocked = false;  
    lockedLabel = null;
    lockedColor = null;
    label = "Waiting for the TM model..."; 
  }
  if (lockedLabel !== null && lockedColor !== null) {
    displayNumber(lockedLabel, size, lockedColor);
  }
}

class Digit {
  constructor(x, y, value, color) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.size = 100;
    this.color = color;
  }

  updateSize(newSize) {
    this.size = newSize;
  }

  display() {
    fill(this.color);
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.value, this.x, this.y);
  }
}

function getColorByValue(value) {
  const colorMap = {
    "0": [255, 255, 255],
    "1": [255, 255, 0],
    "2": [255, 105, 180],
    "3": [135, 206, 235],
    "4": [255, 165, 0],
    "5": [75, 0, 130],
    "6": [255, 182, 193],
    "7": [216, 191, 216],
    "8": [144, 238, 144],
    "9": [0, 100, 0]
  };
  return colorMap[value] || [255, 255, 255];
}

function gotResult(results) {
  if (!isLocked) {
    label = results[0].label;
    lockedLabel = label; 
    lockedColor = getColorByValue(label);  
    isLocked = true; 
    lockStartTime = millis();  
  }
  classifier.classify(video, gotResult);
}

function gotHands(results) {
  hands = results;

  if (hands.length > 0) {
    let hand = hands[0]; 
    let thumb = hand.keypoints[4]; 
    let indexFinger = hand.keypoints[8];  
    let distance = dist(thumb.x, thumb.y, indexFinger.x, indexFinger.y);

    size = map(distance, 50, 300, 50, 300);
  }
}

function displayNumber(label, size, color) {
  let digit = new Digit(width / 2, height / 2, label, color);
  digit.updateSize(size);
  digit.display();
}
