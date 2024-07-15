class Shape {
  constructor(type, x1, y1, x2, y2) {
    this.type = type;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw(ctx) {
    ctx.beginPath();
    if (this.type === 'rect') {
      const x = Math.min(this.x1, this.x2);
      const y = Math.min(this.y1, this.y2);
      const w = Math.abs(this.x1 - this.x2);
      const h = Math.abs(this.y1 - this.y2);
      ctx.rect(x, y, w, h);
    } else if (this.type === 'line') {
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
    } else if (this.type === 'ellipse') {
      const x = (this.x1 + this.x2) / 2;
      const y = (this.y1 + this.y2) / 2;
      const rx = Math.abs(this.x1 - this.x2) / 2;
      const ry = Math.abs(this.y1 - this.y2) / 2;
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    }
    ctx.stroke();
  }
}

class DrawingCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.shapes = [];
    this.isDown = false;
    this.currentShapeType = 'rect';
    this.startPos = { x: 0, y: 0 };
    this.endPos = { x: 0, y: 0 };
    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.canvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
  }

  onPointerDown(e) {
    this.isDown = true;
    this.startPos = { x: e.offsetX, y: e.offsetY };
  }

  onPointerUp(e) {
    this.isDown = false;
    this.endPos = { x: e.offsetX, y: e.offsetY };
    this.addShape(this.currentShapeType, this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
    this.drawAllShapes();
  }

  onPointerMove(e) {
    if (!this.isDown) return;
    this.endPos = { x: e.offsetX, y: e.offsetY };
    this.drawAllShapes();
    this.drawCurrentShape(this.currentShapeType, this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
  }

  addShape(type, x1, y1, x2, y2) {
    this.shapes.push(new Shape(type, x1, y1, x2, y2));
  }

  drawAllShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.shapes.forEach(shape => shape.draw(this.ctx));
  }

  drawCurrentShape(type, x1, y1, x2, y2) {
    const shape = new Shape(type, x1, y1, x2, y2);
    shape.draw(this.ctx);
  }

  setCurrentShapeType(type) {
    this.currentShapeType = type;
  }
}

const drawingCanvas = new DrawingCanvas('canvas');

document.getElementById('line').addEventListener('click', () => drawingCanvas.setCurrentShapeType('line'));
document.getElementById('rect').addEventListener('click', () => drawingCanvas.setCurrentShapeType('rect'));
document.getElementById('ellipse').addEventListener('click', () => drawingCanvas.setCurrentShapeType('ellipse'));
