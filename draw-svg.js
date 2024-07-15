class Shape {
constructor(type, x1, y1, x2, y2) {
  this.type = type;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.element = null;
}

createElement() {
  if (this.type === 'rect') {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  } else if (this.type === 'line') {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "line");
  } else if (this.type === 'ellipse') {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  }
  this.element.setAttribute("fill", "none");
  this.element.setAttribute("stroke", "black");
  this.element.setAttribute("stroke-width", "1");
}

updateElement() {
  if (this.type === 'rect') {
    const x = Math.min(this.x1, this.x2);
    const y = Math.min(this.y1, this.y2);
    const width = Math.abs(this.x1 - this.x2);
    const height = Math.abs(this.y1 - this.y2);
    this.element.setAttribute("x", x);
    this.element.setAttribute("y", y);
    this.element.setAttribute("width", width);
    this.element.setAttribute("height", height);
  } else if (this.type === 'line') {
    this.element.setAttribute("x1", this.x1);
    this.element.setAttribute("y1", this.y1);
    this.element.setAttribute("x2", this.x2);
    this.element.setAttribute("y2", this.y2);
  } else if (this.type === 'ellipse') {
    const cx = (this.x1 + this.x2) / 2;
    const cy = (this.y1 + this.y2) / 2;
    const rx = Math.abs(this.x1 - this.x2) / 2;
    const ry = Math.abs(this.y1 - this.y2) / 2;
    this.element.setAttribute("cx", cx);
    this.element.setAttribute("cy", cy);
    this.element.setAttribute("rx", rx);
    this.element.setAttribute("ry", ry);
  }
}

contains(x, y) {
  if (this.type === 'rect') {
    const left = Math.min(this.x1, this.x2);
    const right = Math.max(this.x1, this.x2);
    const top = Math.min(this.y1, this.y2);
    const bottom = Math.max(this.y1, this.y2);
    return x >= left && x <= right && y >= top && y <= bottom;
  } else if (this.type === 'line') {
    const distToLine = Math.abs((this.y2 - this.y1) * x - (this.x2 - this.x1) * y + this.x2 * this.y1 - this.y2 * this.x1) /
          Math.sqrt((this.y2 - this.y1) ** 2 + (this.x2 - this.x1) ** 2);
    return distToLine < 5;
  } else if (this.type === 'ellipse') {
    const centerX = (this.x1 + this.x2) / 2;
    const centerY = (this.y1 + this.y2) / 2;
    const rx = Math.abs(this.x1 - this.x2) / 2;
    const ry = Math.abs(this.y1 - this.y2) / 2;
    return ((x - centerX) ** 2) / (rx ** 2) + ((y - centerY) ** 2) / (ry ** 2) <= 1;
  }
  return false;
}

move(dx, dy) {
  this.x1 += dx;
  this.y1 += dy;
  this.x2 += dx;
  this.y2 += dy;
  this.updateElement();
}
}

class DrawingCanvas {
constructor(svgId) {
  this.svg = document.getElementById(svgId);
  this.shapes = [];
  this.currentTool = 'pointer'; // Default tool is pointer
  this.startPos = { x: 0, y: 0 };
  this.currentPos = { x: 0, y: 0 };
  this.isDrawing = false;
  this.currentShape = null;
  this.initEvents();
}

initEvents() {
  this.svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));
  this.svg.addEventListener('pointermove', (e) => this.onPointerMove(e));
  this.svg.addEventListener('pointerup', (e) => this.onPointerUp(e));
}

onPointerDown(e) {
  this.isDrawing = true;
  this.startPos = this.getMousePosition(e);
  this.currentPos = this.startPos;
  console.log(`Pointer down at (${this.startPos.x}, ${this.startPos.y})`);

  if (this.currentTool === 'pointer') {
    const shape = this.getShapeAtPosition(this.startPos.x, this.startPos.y);
    if (shape) {
      this.currentShape = shape;
      this.isMovingShape = true;
    }
  } else {
    this.currentShape = new Shape(this.currentTool, this.startPos.x, this.startPos.y, this.startPos.x, this.startPos.y);
    this.currentShape.createElement();
    this.svg.appendChild(this.currentShape.element);
  }
}

onPointerMove(e) {
  if (!this.isDrawing) return;

  const pos = this.getMousePosition(e);
  const dx = pos.x - this.currentPos.x;
  const dy = pos.y - this.currentPos.y;
  this.currentPos = pos;
  console.log(`Pointer move to (${this.currentPos.x}, ${this.currentPos.y})`);

  if (this.isMovingShape && this.currentShape) {
    this.currentShape.move(dx, dy);
  } else if (this.currentShape) {
    this.currentShape.x2 = pos.x;
    this.currentShape.y2 = pos.y;
    this.currentShape.updateElement();
  }
}

onPointerUp(e) {
  this.isDrawing = false;
  console.log(`Pointer up at (${this.currentPos.x}, ${this.currentPos.y})`);

  if (this.currentShape && !this.isMovingShape && this.currentTool !== 'pointer') {
    this.shapes.push(this.currentShape);
  }
  this.currentShape = null;
  this.isMovingShape = false;
}

getMousePosition(e) {
  const CTM = this.svg.getScreenCTM();
  return {
    x: (e.clientX - CTM.e) / CTM.a,
    y: (e.clientY - CTM.f) / CTM.d
  };
}

setCurrentTool(tool) {
  this.currentTool = tool;
  console.log(`Current tool set to: ${tool}`);
}

getShapeAtPosition(x, y) {
  for (let i = this.shapes.length - 1; i >= 0; i--) {
    if (this.shapes[i].contains(x, y)) {
      return this.shapes[i];
    }
  }
  return null;
}
}

const drawingCanvas = new DrawingCanvas('svg');

document.getElementById('pointer').addEventListener('click', () => drawingCanvas.setCurrentTool('pointer'));
document.getElementById('line').addEventListener('click', () => drawingCanvas.setCurrentTool('line'));
document.getElementById('rect').addEventListener('click', () => drawingCanvas.setCurrentTool('rect'));
document.getElementById('ellipse').addEventListener('click', () => drawingCanvas.setCurrentTool('ellipse'));
