// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
// Global variables
const canvas = document.getElementById("asg2");
const mouseDataDiv = document.getElementById("mouseData");
const playerPosDiv = document.getElementById("playerPos");
const playerAngleDiv = document.getElementById("playerAngle");
let playerAngle = 0;

let gl;
let a_Position;
// NOTE: color variable that will be used to store the color of the shapes
let u_FragColor;
let u_Size;
let u_baseColor;
let u_texColorWeight;
// NOTE: this matrix is used to rotate and transalte cubes
let a_UV;
let g_yellowAngle = 0;
let g_purpleAngle = 0;
let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;
let g_yellowAnimation = false;

//NOTE: camera variables
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let g_globalAngle = 0;
let g_camera;

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  v_UV = a_UV;
  }
`;

// Fragment shader program

// uniform int u_whichTexture;
// uniform float t;
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
uniform vec4 u_FragColor;
uniform int u_whichTexture;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform float colorMixerIntensity;
uniform float u_texColorWeight; // Blending weight (0 to 1 )
uniform vec4 u_baseColor; // Base Color

void main() {
vec4 colorMixer;

if(u_whichTexture == -4){
colorMixer = vec4(1,.2,.2,1);

}else if(u_whichTexture == -3) {
colorMixer = vec4(v_UV, 1.0, 1.0); 
}

else if(u_whichTexture == -2){
colorMixer = texture2D(u_Sampler2, v_UV); 
}
else if(u_whichTexture == -1){
colorMixer = texture2D(u_Sampler1, v_UV); 
}

else if(u_whichTexture == 0){
colorMixer = texture2D(u_Sampler0, v_UV); 
}
else if(u_whichTexture == 1){
colorMixer = u_FragColor;
}
else{

colorMixer = u_FragColor;
}
gl_FragColor = colorMixer * u_texColorWeight;
gl_FragColor = (1.0 -  u_texColorWeight) * u_baseColor + u_texColorWeight * colorMixer;

}
`;
// NOTE: this code if for the using a live texuture:
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture = 1;

function setupWebGL() {
  // Rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}
function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }
  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }
  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return false;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sampler1");
    return false;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  if (!u_Sampler2) {
    console.log("Failed to get the storage location of u_Sampler2");
    return false;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture");
    return false;
  }

  // NOTE: had to comment out because it was unused to the u_FragColor is tossed out by the compiler

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix",
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }
  u_texColorWeight = gl.getUniformLocation(gl.program, "u_texColorWeight");
  if (!u_texColorWeight) {
    console.log("failed to get the storage location of u_texcolorweight");
    return;
  } else {
    console.log("connected the u_texColorWeight");
  }

  u_baseColor = gl.getUniformLocation(gl.program, "u_baseColor");
  if (!u_baseColor) {
    console.log("Failed to get the storage location of u_baseColor");
    return;
  }
}

// NOTE: texture handling
function initTextures() {
  // Get the storage location of u_Sampler
  var skyImageObj = new Image(); // Create the image object
  var image1 = new Image(); // Create the image object
  var image2 = new Image(); // Create the image object
  if (!skyImageObj) {
    console.log("Failed to create the image object");
    return false;
  }
  if (!image1) {
    console.log("Failed to create the image object");
    return false;
  }
  if (!image2) {
    console.log("Failed to create the image object");
    return false;
  }
  // Register the event handler to be called on loading an image
  skyImageObj.onload = function () {
    sendTextureToTEXTURE0(skyImageObj);
  };
  image1.onload = function () {
    sendTextureToTEXTURE1(image1);
  };
  image2.onload = function () {
    sendTextureToTEXTURE2(image2);
  };
  // Tell the browser to load an image
  skyImageObj.src = "sky1.jpg";
  image1.src = "grass1.png";
  image2.src = "wall.jpg";

  // NOTE: texture needs to be a power of 2
  //can add more texturese later here
  return true;
}

function sendTextureToGLSL(image, sampler) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(sampler, 0);
  // gl.uniform1i(u_Sampler1, 0);
  // if (sampler == 0) {
  //   gl.uniform1i(u_Sampler0, 0);
  // } else if (sampler == 0) {
  //   gl.uniform1i(u_Sampler1, 0);
  // }
  console.log(sampler);

  // gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log("finished loadTexture");
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log("Finished loadTexture");
}
// ================================SKY
function sendTextureToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log("Finished loadTexture1");
}

function sendTextureToTEXTURE2(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log("Finished loadTexture2");
}
// NOTE: handles the ui part and cursor moments;

function changeBaseColorAndIntensity(rgba, textureIntensity) {
  gl.uniform4f(u_baseColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  gl.uniform1f(u_texColorWeight, textureIntensity);
}
function lockCursor() {
  canvas.requestPointerLock =
    canvas.requestPointerLock ||
    canvas.mozRequestPointerLock ||
    canvas.webkitRequestPointerLock;
  if (canvas.requestPointerLock) {
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    canvas.requestPointerLock();
  }
}

// Pointer Lock Change Handler
function handlePointerLockChange() {
  if (document.pointerLockElement === canvas) {
    document.body.style.overflow = "hidden";
    // Cursor is locked
  } else {
    document.body.style.overflow = "auto";
    // Cursor is unlocked
  }
}

let lastX = canvas.width / 2;
let lastY = canvas.height / 2;
function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // sets up the shadow programs and also the
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  g_camera = new Camera();
  document.onkeydown = keydown;
  document.onkeyup = keyup;

  initTextures();

  changeBaseColorAndIntensity([1, 0, 0, 1], 0.8);

  // initTextures("dirt.jpg", u_Sampler0);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
  playerPosDiv.textContent = `player pos x: ${Math.round(g_camera.eye.elements[0])}---y:${Math.round(g_camera.eye.elements[2])}`;
}

// this function is the function that will instiate to start the scene
function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
let g_eye = [0, 0, 3];
let g_at = [0, 0, -100];
var g_up = [0, 1, 0];

// NOTE: 1 is the regular walls and and 2 is for roof
// Define the size of the grid
const rows = 20;
const cols = 20;
const defaultValue = 1;

// Initialize the grid with a for loop
let g_map = [
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 1, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
  [2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1],
];

// for (let i = 0; i < rows; i++) {
//     // Create a new row
//     let row = [];
//     for (let j = 0; j < cols; j++) {
//         // Add the default value to each column in the row
//         row.push(defaultValue);
//     }
//     // Add the row to the grid
//     g_map.push(row);
// }
// g_map[0][0] = 2;

let playerPosX = 0;
let playerPosY = 0;
let tracerBlockX1 = 0;
let tracerBlockY1 = 0;
function drawWalls() {
  var lvl1 = new Cube();

  for (x = 0; x < g_map.length; x++) {
    for (y = 0; y < g_map[x].length; y++) {
      for (z = 0; z < 3; z++) {
        let blockSelected = 1;
        if (x == tracerBlockX1 && y == tracerBlockY1) {
          blockSelected = 0.2;
          if (g_map[x][y] != 1 && g_map[x][y] != 2) {
            changeBaseColorAndIntensity([0, 0, 1, 0.4], 0.1);
            lvl1.color = [0.0, 1.0, 0.0, 0.5];
            lvl1.matrix.setTranslate(x - 10, 0 - 0.75, y - 10);
            lvl1.matrix.scale(1, 0.2, 1);
            lvl1.textureNum = 0;
            lvl1.render();
            changeBaseColorAndIntensity([0, 0, 1, 1], 1);
          }
        }
        if (g_map[x][y] == 1) {
          changeBaseColorAndIntensity([1, 0, 0, 0.4], blockSelected);
          lvl1.color = [1.0, 0.0, 0.0, 1.0];
          lvl1.matrix.setTranslate(x - 10, z - 0.75, y - 10);
          lvl1.textureNum = -2;
          lvl1.render();
          changeBaseColorAndIntensity([0, 0, 1, 1], 1);
        }
        // if (x == playerPosX && y == playerPosY) {
        //   changeBaseColorAndIntensity([0, 0, 1, 0.4], 0.3);
        //   lvl1.color = [0.0, 1.0, 0.0, 0.5];
        //   lvl1.matrix.setTranslate(x - 10, z - 0.75, y - 10);
        //   lvl1.textureNum = 0;
        //   lvl1.render();
        //   changeBaseColorAndIntensity([0, 0, 1, 1], 1);
        // }

        if (g_map[x][y] == 2) {
          changeBaseColorAndIntensity([1, 0, 0, 0.4], blockSelected);
          lvl1.color = [1.0, 0.0, 0.0, 1.0];
          lvl1.matrix.setTranslate(x - 10, 2.25, y - 10);
          lvl1.textureNum = -2;
          lvl1.render();
          changeBaseColorAndIntensity([0, 0, 1, 1], 1);
        }
      }
    }
  }
}

function renderAllShapes() {
  var projMat = g_camera.projMat;
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = g_camera.viewMat;
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // NOTE: draws a new cube and scales and translates it color is red

  drawPenguin();
  var floor = new Cube();
  floor.color = [1.0, 0.0, 0.0, 1.0];
  floor.textureNum = -1;
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(20, 0, 20);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  renderSky();
  tracker();
  drawWalls();
}

let block = 0;
let maxZ = 10;
function changeBlock() {
  maxZ = g_camera.eye.elements[2];
  // NOTE: offset by default g_camera.elements[2] and also the offset in drawwlls
  g_map[tracerBlockX1][tracerBlockY1] = block;
}
function tracker() {
  maxZ = g_camera.eye.elements[2];

  let x = Math.ceil(g_camera.eye.elements[0] + 9);
  let y = Math.ceil(maxZ + 9);
  playerPosX = x;
  playerPosY = y;
  whereToDeleteAndAddBlock(normalizeAngle(playerAngle));

  // playerPosDiv.textContent = `${g_camera.eye.elements[0].toFixed(3)}---${g_camera.eye.elements[1].toFixed(3)}---${g_camera.eye.elements[2].toFixed(3)}`;
  playerPosDiv.textContent = `player pos x: ${Math.round(g_camera.eye.elements[0])}---y:${Math.round(g_camera.eye.elements[2])}`;
}

function renderSky() {
  changeBaseColorAndIntensity([1, 0, 0, 1], 0.7);
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();
  changeBaseColorAndIntensity([0, 1, 0, 1], 1);
}

let lastFPSUpdate = 0;
const fpsUpdateInterval = 1.0; // update every second
let accumulatedFPS = 0;
let frameCount = 0;
let then = 0;

function tick(now) {
  requestAnimationFrame(tick);

  now *= 0.001; // convert to seconds
  const deltaTime = now - then; // compute time since last frame
  then = now; // remember time for next frame

  // Accumulate frames and their time intervals
  accumulatedFPS += 1 / deltaTime;
  frameCount++;

  // Check if at least one second has elapsed since the last FPS update
  if (now - lastFPSUpdate >= fpsUpdateInterval) {
    const averagedFPS = accumulatedFPS / frameCount; // calculate average FPS over the interval
    fpsElem.textContent = averagedFPS.toFixed(1); // update fps display
    lastFPSUpdate = now; // reset the timer
    accumulatedFPS = 0; // reset accumulated FPS
    frameCount = 0; // reset frame count
  }

  updateAnimationAngle();

  // renderScene();
  renderAllShapes();
}

function updateAnimationAngle() {
  if (g_yellowAnimation) {
    g_yellowAngle = 45 * Math.sin(g_seconds);
  }
}

// NOTE: cursor movements

// Track Cursor Movement
let fpsElem;

function normalizeAngle(angle) {
  let normalizedAngle = angle % 360;
  if (normalizedAngle < 0) {
    normalizedAngle += 360;
  }
  return normalizedAngle;
}

function whereToDeleteAndAddBlock(angle) {
  if ((337.5 < angle && angle < 360) || (0 < angle && angle < 22.5)) {
    // Your code here
    tracerBlockX1 = playerPosX;
    tracerBlockY1 = playerPosY - 1;
  } else if (22.5 < angle && angle < 67.5) {
    tracerBlockX1 = playerPosX + 1;
    tracerBlockY1 = playerPosY - 1;
  } else if (67.5 < angle && angle < 112.5) {
    tracerBlockX1 = playerPosX + 1;
    tracerBlockY1 = playerPosY;
  } else if (112.5 < angle && angle < 157.5) {
    tracerBlockX1 = playerPosX + 1;
    tracerBlockY1 = playerPosY + 1;
  } else if (157.5 < angle && angle < 202.5) {
    tracerBlockX1 = playerPosX;
    tracerBlockY1 = playerPosY + 1;
  } else if (202.5 < angle && angle < 247.5) {
    tracerBlockX1 = playerPosX - 1;
    tracerBlockY1 = playerPosY + 1;
  } else if (247.5 < angle && angle < 292.5) {
    tracerBlockX1 = playerPosX - 1;
    tracerBlockY1 = playerPosY;
  } else if (292.5 < angle && angle < 337.5) {
    tracerBlockX1 = playerPosX - 1;
    tracerBlockY1 = playerPosY - 1;
  }
}

function handleMouseMove(event) {
  if (document.pointerLockElement === canvas) {
    const deltaX = event.movementX;
    const deltaY = event.movementY;

    // Update player rotation or camera based on deltaX and deltaY
    // (This part will depend on your specific game logic)

    lastX = event.clientX;
    lastY = event.clientY;
    if (event.movementX < 0) {
      // NOTE:have to invert coordinate to correspond to mouse movements
      g_camera.panLeft(-event.movementX * 0.6);
    }
    if (event.movementX > 0) {
      g_camera.panRight(-event.movementX * 0.6);
    }
    g_camera.panY(-event.movementY);
    let normalizeAng = normalizeAngle(playerAngle);
    playerAngle = playerAngle + event.movementX * 0.6;

    playerAngleDiv.textContent = `player Angle ${normalizeAng}`;

    // Update mouse data display
    mouseDataDiv.textContent = `${event.movementX}, ${event.movementY},`; // Update with delta values
    whereToDeleteAndAddBlock(normalizeAng);
    // playerPosDiv.textContent = `${g_camera.at.elements[-1]}---${g_camera.at.elements[1]}---${g_camera.at.elements[2]}`;

    // NOTE: block in front = -1 of playerPos
  }
}

function handleMouseClick(event) {
  if (document.pointerLockElement === canvas) {
    switch (event.button) {
      case 0: // Left button
        block = 1;
        changeBlock();
        // Implement left-click specific logic here
        break;
      // case 1: // Middle button (scroll wheel button)
      //     console.log("Middle button clicked");
      //     // Implement middle-click specific logic here
      //     break;
      case 2: // Right button
        block = 0;
        changeBlock();
        // Implement right-click specific logic here
        break;
    }
  }
}

// Add event listener using the encapsulated function

function addActionsForHtmlUI() {
  fpsElem = document.getElementById("fps");
  fpsCounter = document.getElementById("fps");
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mousedown", handleMouseClick);
  canvas.addEventListener("click", lockCursor);
}

let shiftDown = false;
let intervalId = null; // Variable to store the interval ID
let key = "";
function userDown() {
  if (shiftDown) {
    g_camera.cameraYaxis(-0.3);
  }
}

function keydown(ev) {
  if (ev.keyCode == 39 || ev.keyCode == 68) {
    // Right Arrow or D
    g_camera.right();
    g_eye[0] += 0.2;
  } else if (ev.keyCode == 37 || ev.keyCode == 65) {
    // Left Arrow or A
    g_camera.left();
    g_eye[0] -= 0.2;
  } else if (ev.keyCode == 38 || ev.keyCode == 87) {
    // up Arrow or W
    g_camera.forward();
  } else if (ev.keyCode == 40 || ev.keyCode == 83) {
    // down Arrow or S
    g_camera.back();
  } else if (ev.keyCode == 81) {
    // Q
    g_camera.panLeft();
    playerAngle = playerAngle - 10;
    whereToDeleteAndAddBlock(normalizeAngle(playerAngle));
  } else if (ev.keyCode == 69) {
    playerAngle = playerAngle + 10;
    whereToDeleteAndAddBlock(normalizeAngle(playerAngle));
    // E
    g_camera.panRight();
  } else if (ev.keyCode == 32) {
    g_camera.cameraYaxis(0.3);
  } else if (ev.keyCode == 16) {
    shiftDown = true;
    intervalId = setInterval(userDown, 70);
  } else if (ev.key == "j") {
    block = 1;
    changeBlock();
  } else if (ev.key == "u") {
    block = 0;
    changeBlock();
  }
  playerPosDiv.textContent = `player pos x: ${Math.round(g_camera.eye.elements[0])}---y:${Math.round(g_camera.eye.elements[2])}`;
}

function keyup(ev) {
  if (ev.keyCode == 16) {
    shiftDown = false;
    clearInterval(intervalId);
    intervalId = null;
  }
}
