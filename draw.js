const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let isDown = false;
let shapeType = 'rect'; // Default shape

const mouse = { x: 0, y: 0 };
let cmouse = { x: 0, y: 0 };

const shapes = [];

document.getElementById('line').addEventListener('click', () => shapeType = 'line');
document.getElementById('rect').addEventListener('click', () => shapeType = 'rect');
document.getElementById('ellipse').addEventListener('click', () => shapeType = 'ellipse');

canvas.addEventListener("pointerdown", (e) => {
  isDown = true;
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
});

canvas.addEventListener("pointerup", (e) => {
  isDown = false;
  cmouse.x = e.offsetX;
  cmouse.y = e.offsetY;
  addShape(shapeType);
  drawAllShapes();
});

canvas.addEventListener("pointermove", (e) => {
  if (isDown) {
    cmouse.x = e.offsetX;
    cmouse.y = e.offsetY;
    drawAllShapes();
    drawShape(shapeType, mouse.x, mouse.y, cmouse.x, cmouse.y);
  }
});

function addShape(type) {
  const x = Math.min(mouse.x, cmouse.x);
  const y = Math.min(mouse.y, cmouse.y);
  const w = Math.abs(mouse.x - cmouse.x);
  const h = Math.abs(mouse.y - cmouse.y);
  shapes.push({ type, x, y, w, h, startX: mouse.x, startY: mouse.y, endX: cmouse.x, endY: cmouse.y });
}

function drawAllShapes() {
  ctx.clearRect(0, 0, width, height);
  shapes.forEach(shape => {
    drawShape(shape.type, shape.startX, shape.startY, shape.endX, shape.endY);
  });
}

function drawShape(type, x1, y1, x2, y2) {
  ctx.beginPath();
  if (type === 'rect') {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const w = Math.abs(x1 - x2);
    const h = Math.abs(y1 - y2);
    ctx.rect(x, y, w, h);
  } else if (type === 'line') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  } else if (type === 'ellipse') {
    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;
    const rx = Math.abs(x1 - x2) / 2;
    const ry = Math.abs(y1 - y2) / 2;
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  }
  ctx.stroke();
}
