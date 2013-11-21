function addToBuffer(datum) {
  return extend(datum.path = [], { coords: [], id: datum.id })
}

function addLine(x1, y1, x2, y2) {
  this.push(toBuffer([x1, y1, 0, x2, y2, 0]))
}

function applyTransforms(node) {
  gl.uniform2f(program.translate, node.attr.translate[0] + node.attr.cx + node.attr.x,
               node.attr.translate[0] + node.attr.cy + node.attr.y)
  gl.uniform2fv(program.scale, node.attr.scale)
  gl.uniform2fv(program.rotation, node.attr.rotation)
  gl.uniform1f(program.opacity, node.attr.opacity)
}

function drawPolygon(buffer) {
  setDrawColor(d3.rgb(this.attr.fill))
  drawBuffer(buffer, gl.TRIANGLE_FAN)
}

function drawBuffer(buffer, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(program.vertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.drawArrays(type, 0, buffer.numItems)
}

function drawPath(node) {
  if (node.attr.fill[0] === '#' && program.name !== node.attr.fill) {
    gl.useProgram(program = programs[node.attr.fill])
    program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
    gl.enableVertexAttribArray(program.vertexPosition)
  }

  applyTransforms(node)

  node.buffer && drawPolygon.call(node, node.buffer)

  setDrawColor(d3.rgb(node.attr.stroke))

  for (var i = 0; i < node.path.length; i++)
    drawBuffer(node.path[i], gl.LINE_STRIP)
}

function render() {
  canvas.__rerender__ = true
}

function setDrawColor (c) {
  gl.uniform4f(program.rgb,
               c.r / 256,
               c.g / 256,
               c.b / 256,
               1.0)
}

function buildBuffer(points) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
  buffer.itemSize = 3
  buffer.numItems = points.length / buffer.itemSize
  return buffer
}

function toBuffer (array) {
  return buildBuffer(flatten(array))
}

function circlePoints(r) {
  var a = []
  for (var i = 0; i < 360; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0)
  return a
}


function rectPoints(h, w) {
  return [0,0,0,
          0,h,0,
          w,h,0,
          w,0,0,
         ]
}
