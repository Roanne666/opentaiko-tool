type Vector2 = {
  x: number;
  y: number;
};

export function createBeatmapImage(context: CanvasRenderingContext2D) {
  drawDon(context, { x: 0, y: 0 });
}

function drawDon(context: CanvasRenderingContext2D, position: Vector2) {
  context.fillStyle = "red";
  context.fillRect(position.x * 100, position.y * 100, 10, 10);
}
