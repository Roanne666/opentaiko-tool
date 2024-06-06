import {
  type Vector2,
  markFont,
  lightLineColor,
  drakLineColor,
  beatWidth,
  startPos,
  rowSpace,
  gogotimeBackgroundColor,
  rowHeight,
  beatPerRow,
} from "./const";

/**
 * 绘制小节相关内容
 * @param context
 * @param gridInfo
 */
export function drawPart(
  context: CanvasRenderingContext2D,
  partCount: number,
  measure: [number, number],
  gridInfo: Vector2,
  gogotime = false
) {
  const partPerRow = Math.floor(beatPerRow / measure[0]);
  const subParts = measure[0] * 2;
  const partWidth = beatWidth * measure[0];

  const beginPos: Vector2 = {
    x: startPos.x + partWidth * gridInfo.x,
    y: startPos.y + (rowHeight + rowSpace) * gridInfo.y - 15,
  };

  const endPos: Vector2 = {
    x: startPos.x + partWidth * gridInfo.x,
    y: startPos.y + (rowHeight + rowSpace) * gridInfo.y + rowHeight,
  };

  context.save();

  context.font = markFont;

  // gogotime背景色
  if (gogotime) {
    context.fillStyle = gogotimeBackgroundColor;

    // 第一小节时补齐左侧，最后小节时补齐右侧
    if (gridInfo.x === 0) {
      context.fillRect(beginPos.x - startPos.x, beginPos.y - 2, partWidth + startPos.x, 15);
    } else if (gridInfo.x === partPerRow - 1) {
      context.fillRect(beginPos.x, beginPos.y - 2, partWidth + startPos.x, 15);
    } else {
      context.fillRect(beginPos.x, beginPos.y - 2, partWidth, 15);
    }
  }

  // 小节数字标注
  context.fillStyle = "black";
  context.fillText(`${partCount + 1}`, beginPos.x + 5, beginPos.y + 10);

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
  for (let i = 1; i < subParts; i++) {
    context.save();
    if (i % 2 === 0) {
      context.strokeStyle = lightLineColor;
    } else {
      context.strokeStyle = drakLineColor;
    }

    const subBeginPos: Vector2 = {
      x: startPos.x + partWidth * gridInfo.x + (partWidth / subParts) * i,
      y: startPos.y + (rowHeight + rowSpace) * gridInfo.y + 4,
    };

    const subEndPos: Vector2 = {
      x: startPos.x + partWidth * gridInfo.x + (partWidth / subParts) * i,
      y: startPos.y + rowHeight + (rowHeight + rowSpace) * gridInfo.y - 4,
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
    x: startPos.x + partWidth * (gridInfo.x + 1),
    y: startPos.y + (rowHeight + rowSpace) * gridInfo.y,
  };

  const finalEndPos: Vector2 = {
    x: startPos.x + partWidth * (gridInfo.x + 1),
    y: startPos.y + (rowHeight + rowSpace) * gridInfo.y + rowHeight,
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
