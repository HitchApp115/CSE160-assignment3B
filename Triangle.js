// class Triangle {
//   constructor() {
//     this.type = "triangle";
//     this.position = [0.0, 0.0, 0.0];
//     this.color = [1.0, 1.0, 1.0, 1.0];
//     this.size = 5.0;
//     this.matrix = new Matrix4();
//   }
//   render() {
//     var xy = this.position;
//     var rgba = this.color;
//     var size = this.size;
//
//     // Pass the color of a point to u_FragColor variable
//     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
//     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
//     // Pass the size of a point to u_Size variable
//     gl.uniform1f(u_Size, size);
//     // Draw
//     // gl.drawArrays(gl.POINTS, 0, 1);
//     var d = this.size / 200.0; //delta
//     //this basically controls the spacing betwen the points in the trianles gives it thatoffset
//     drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
//   }
// }

class Triangle {
  constructor() {
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front Triangle
    drawTriangle3D([-0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 0.5, 0.0, 0.0]);
    //Back Triangle
    drawTriangle3D([-0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.5, 0.0, 0.25]);
    // Left
    drawTriangle3D([-0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.0, 1.0, 0.0]);
    drawTriangle3D([-0.5, 0.0, 0.25, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0]);
    // Right
    drawTriangle3D([0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.0, 1.0, 0.0]);
    drawTriangle3D([0.5, 0.0, 0.25, 0.5, 0.0, 0.0, 0.0, 1.0, 0.0]);
    // Bottom
    drawTriangle3D([0.5, 0.0, 0.0, 0.5, 0.0, 0.25, -0.5, 0.0, 0.0]);
    drawTriangle3D([-0.5, 0.0, 0.25, -0.5, 0.0, 0.0, 0.5, 0.0, 0.0]);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  }
}

function drawTriangle(vertices) {
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();

  //create a buffer object
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  //DYNAMIC_DRAW indicates that we are going to keep reusing the buffer over and over

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_vertexBuffer = null;
function initTriangle3D() {
  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log("Failed to creat the buffer object");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);
}
function drawTriangle3D(vertices) {
  var n = vertices.length / 3; // The number of vertices
  // if (g_vertexBuffer == null) {
  //   initTriangle3D();
  // }
  // initTriangle3D();

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  //
  // //create a buffer object
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }
  // // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  //
  // // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  //
  // //DYNAMIC_DRAW indicates that we are going to keep reusing the buffer over and over
  //
  // // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  //
  // // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
  var n = 3; // The number of vertices
  var vertexBuffer = gl.createBuffer();

  //create a buffer object
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  //DYNAMIC_DRAW indicates that we are going to keep reusing the buffer over and over

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Create a buffer object
  var uvBuffer = gl.createBuffer();
  //create a buffer object
  if (!uvBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  //DYNAMIC_DRAW indicates that we are going to keep reusing the buffer over and over

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  g_vertexBuffer = null;
}
