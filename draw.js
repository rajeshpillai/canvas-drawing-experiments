class Shape {
  constructor(type, x1, y1, x2, y2) {
    this.type = type;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.selected = false;
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

    if (this.selected) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
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
  }
}

class DrawingCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.shapes = [];
    this.isDown = false;
    this.currentTool = 'pointer'; // Default tool is pointer
    this.startPos = { x: 0, y: 0 };
    this.currentPos = { x: 0, y: 0 };
    this.selectedShape = null;
    this.isMovingShape = false;
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
    this.currentPos = { x: e.offsetX, y: e.offsetY };
    console.log(`Pointer down at (${this.startPos.x}, ${this.startPos.y})`);

    if (this.currentTool === 'pointer') {
      const shape = this.getShapeAtPosition(this.startPos.x, this.startPos.y);
      if (shape) {
        this.selectedShape = shape;
        this.selectedShape.selected = true;
        this.isMovingShape = true;
      } else {
        this.selectedShape = null;
        this.isMovingShape = false;
      }
      this.drawAllShapes();
    }
  }

  onPointerUp(e) {
    this.isDown = false;
    this.currentPos = { x: e.offsetX, y: e.offsetY };
    console.log(`Pointer up at (${this.currentPos.x}, ${this.currentPos.y})`);

    if (!this.isMovingShape && this.currentTool !== 'pointer') {
      this.addShape(this.currentTool, this.startPos.x, this.startPos.y, this.currentPos.x, this.currentPos.y);
    }
    this.drawAllShapes();
    this.isMovingShape = false;
  }

  onPointerMove(e) {
    if (!this.isDown) return;

    const dx = e.offsetX - this.currentPos.x;
    const dy = e.offsetY - this.currentPos.y;
    this.currentPos = { x: e.offsetX, y: e.offsetY };
    console.log(`Pointer move to (${this.currentPos.x}, ${this.currentPos.y})`);

    if (this.isMovingShape && this.selectedShape) {
      this.selectedShape.move(dx, dy);
      this.drawAllShapes();
    } else if (this.currentTool !== 'pointer') {
      this.drawAllShapes();
      this.drawCurrentShape(this.currentTool, this.startPos.x, this.startPos.y, this.currentPos.x, this.currentPos.y);
    }
  }

  addShape(type, x1, y1, x2, y2) {
    console.log(`Adding shape: ${type} from (${x1}, ${y1}) to (${x2}, ${y2})`);
    this.shapes.push(new Shape(type, x1, y1, x2, y2));
  }

  drawAllShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.shapes.forEach(shape => shape.draw(this.ctx));
  }

  drawCurrentShape(type, x1, y1, x2, y2) {
    console.log(`Drawing current shape: ${type} from (${x1}, ${y1}) to (${x2}, ${y2})`);
    const shape = new Shape(type, x1, y1, x2, y2);
    shape.draw(this.ctx);
  }

  setCurrentTool(tool) {
    this.currentTool = tool;
    console.log(`Current tool set to: ${tool}`);
    this.deselectAllShapes();
  }

  getShapeAtPosition(x, y) {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.shapes[i].contains(x, y)) {
        return this.shapes[i];
      }
    }
    return null;
  }

  deselectAllShapes() {
    this.shapes.forEach(shape => shape.selected = false);
    this.drawAllShapes();
  }
}

const drawingCanvas = new DrawingCanvas('canvas');

document.getElementById('pointer').addEventListener('click', () => drawingCanvas.setCurrentTool('pointer'));
document.getElementById('line').addEventListener('click', () => drawingCanvas.setCurrentTool('line'));
document.getElementById('rect').addEventListener('click', () => drawingCanvas.setCurrentTool('rect'));
document.getElementById('ellipse').addEventListener('click', () => drawingCanvas.setCurrentTool('ellipse'));
