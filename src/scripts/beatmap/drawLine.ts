import { type Vector2, markFont, lightLineColor, drakLineColor, partSize, startPos, partRowSpace } from "./const";

export function drawLine(context: CanvasRenderingContext2D, gridInfo: Vector2) {
  const beginPos: Vector2 = {
    x: startPos.x + partSize.x * gridInfo.x,
    y: startPos.y + (partSize.y + partRowSpace) * gridInfo.y - 15,
  };

  const endPos: Vector2 = {
    x: startPos.x + partSize.x * gridInfo.x,
    y: startPos.y + (partSize.y + partRowSpace) * gridInfo.y + partSize.y,
  };

  context.save();

  context.font = markFont;

  // 小节标注
  context.fillStyle = "black";
  context.fillText(`${gridInfo.y * 4 + gridInfo.x + 1}`, beginPos.x + 5, beginPos.y + 10);

  // 节拍竖线
  context.lineWidth = 2;
  context.strokeStyle = "white";
  context.beginPath();
  context.moveTo(beginPos.x, beginPos.y);
  context.lineTo(endPos.x, endPos.y);
  context.stroke();
  context.closePath();
  context.restore();

  // 细分竖线
  for (let i = 1; i < 8; i++) {
    context.save();
    if (i % 2 === 0) {
      context.strokeStyle = lightLineColor;
    } else {
      context.strokeStyle = drakLineColor;
    }

    const subBeginPos: Vector2 = {
      x: startPos.x + partSize.x * gridInfo.x + (partSize.x / 8) * i,
      y: startPos.y + (partSize.y + partRowSpace) * gridInfo.y + 4,
    };

    const subEndPos: Vector2 = {
      x: startPos.x + partSize.x * gridInfo.x + (partSize.x / 8) * i,
      y: startPos.y + partSize.y + (partSize.y + partRowSpace) * gridInfo.y - 4,
    };

    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(subBeginPos.x, subBeginPos.y);
    context.lineTo(subEndPos.x, subEndPos.y);
    context.stroke();
    context.closePath();

    context.restore();
  }

  // 结束线
  const finalBeginPos: Vector2 = {
    x: startPos.x + partSize.x * (gridInfo.x + 1),
    y: startPos.y + (partSize.y + partRowSpace) * gridInfo.y,
  };

  const finalEndPos: Vector2 = {
    x: startPos.x + partSize.x * (gridInfo.x + 1),
    y: startPos.y + (partSize.y + partRowSpace) * gridInfo.y + partSize.y,
  };
  context.save();
  context.strokeStyle = "white";
  context.beginPath();
  context.moveTo(finalBeginPos.x, finalBeginPos.y);
  context.lineTo(finalEndPos.x, finalEndPos.y);
  context.stroke();
  context.closePath();
  context.restore();
}
