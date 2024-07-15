class Shape {
    constructor(type, x1, y1, x2, y2) {
      this.type = type;
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.selected = false;
      this.element = null;
    }

    draw(svg) {
      if (!this.element) {
        if (this.type === 'rect') {
          this.element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        } else if (this.type === 'line') {
          this.element = document.createElementNS("http://www.w3.org/2000/svg", "line");
        } else if (this.type === 'ellipse') {
          this.element = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        }
        svg.appendChild(this.element);
      }

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
      } else if (this.type === 'ellipse") {
        const cx = (this.x1 + this.x2) / 2;
        const cy = (this.y1 + this.y2) / 2;
        const rx = Math.abs(this.x1 - this.x2) / 2;
        const ry = Math.abs(this.y1 - this.y2) / 2;
        this.element.setAttribute("cx", cx);
        this.element.setAttribute("cy", cy);
        this.element.setAttribute("rx", rx);
        this.element.setAttribute("ry", ry);
      }

      if (this.selected) {
        this.element.setAttribute("stroke", "red");
        this.element.setAttribute("stroke-width", "2");
      } else {
        this.element.setAttribute("stroke", "black");
        this.element.setAttribute("stroke-width", "1");
      }
      this.element.setAttribute("fill", "none");
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
    constructor(svgId) {
      this.svg = document.getElementById(svgId);
      this.shapes = [];
      this.isDown = false;
      this.currentTool = 'pointer'; // Default tool is pointer
      this.startPos = { x: 0, y: 0 };
      this.currentPos = { x: 0, y: 0 };
      this.selectedShape = null;
      this.isMovingShape = false;
      this.currentShape = null;
      this.initEvents();
    }

    initEvents() {
      this.svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      this.svg.addEventListener('pointerup', (e) => this.onPointerUp(e));
      this.svg.addEventListener('pointermove', (e) => this.onPointerMove(e));
    }

    onPointerDown(e) {
      this.isDown = true;
      this.startPos = this.getMousePosition(e);
      this.currentPos = this.startPos;
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
      } else {
        this.currentShape = new Shape(this.currentTool, this.startPos.x, this.startPos.y, this.currentPos.x, this.currentPos.y);
        this.currentShape.draw(this.svg);
      }
    }

    onPointerUp(e) {
      this.isDown = false;
      this.currentPos = this.getMousePosition(e);
      console.log(`Pointer up at (${this.currentPos.x}, ${this.currentPos.y})`);

      if (!this.isMovingShape && this.currentTool !== 'pointer' && this.currentShape) {
        this.currentShape.x2 = this.currentPos.x;
        this.currentShape.y2 = this.currentPos.y;
        this.shapes.push(this.currentShape);
        this.currentShape = null;
      }
      this.drawAllShapes();
      this.isMovingShape = false;
    }

    onPointerMove(e) {
      if (!this.isDown) return;

      const dx = this.getMousePosition(e).x - this.currentPos.x;
      const dy = this.getMousePosition(e).y - this.currentPos.y;
      this.currentPos = this.getMousePosition(e);
      console.log(`Pointer move to (${this.currentPos.x}, ${this.currentPos.y})`);

      if (this.isMovingShape && this.selectedShape) {
        this.selectedShape.move(dx, dy);
        this.drawAllShapes();
      } else if (this.currentTool !== 'pointer' && this.currentShape) {
        this.currentShape.x2 = this.currentPos.x;
        this.currentShape.y2 = this.currentPos.y;
        this.drawAllShapes();
        this.currentShape.draw(this.svg);
      }
    }

    getMousePosition(e) {
      const CTM = this.svg.getScreenCTM();
      return {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d
      };
    }

    addShape(type, x1, y1, x2, y2) {
      console.log(`Adding shape: ${type} from (${x1}, ${y1}) to (${x2}, ${y2})`);
      const shape = new Shape(type, x1, y1, x2, y2);
      shape.draw(this.svg);
      this.shapes.push(shape);
    }

    drawAllShapes() {
      while (this.svg.firstChild) {
        this.svg.removeChild(this.svg.firstChild);
      }
      this.shapes.forEach(shape => shape.draw(this.svg));
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

  const drawingCanvas = new DrawingCanvas('svg');

  document.getElementById('pointer').addEventListener('click', () => drawingCanvas.setCurrentTool('pointer'));
  document.getElementById('line').addEventListener('click', () => drawingCanvas.setCurrentTool('line'));
  document.getElementById('rect').addEventListener('click', () => drawingCanvas.setCurrentTool('rect'));
  document.getElementById('ellipse').addEventListener('click', () => drawingCanvas.setCurrentTool('ellipse'));
