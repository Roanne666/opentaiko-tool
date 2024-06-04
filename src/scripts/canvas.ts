import type { DifficultyInfo } from "@server/song";

type Vector2 = {
  x: number;
  y: number;
};

export function createBeatmapImage(canvas: HTMLCanvasElement, bpm: number, info: DifficultyInfo) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  const startPos: Vector2 = { x: 50, y: 50 };

  const partSize: Vector2 = { x: 240, y: 35 };

  const partSpace = 45;

  let measurePartCount = -1;
  let currentRow = -1;

  const beatmapColumns = Math.ceil(info.beatmap.reduce((pn, beatmapPart) => pn + beatmapPart.notesArray.length, 0) / 4);

  canvas.height = startPos.y + beatmapColumns * (partSize.y + partSpace) - partSpace + 50;
  context.save();
  context.fillStyle = "rgb(204,204,204)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();

  for (let i = 0; i < info.beatmap.length; i++) {
    const part = info.beatmap[i];

    for (let j = 0; j < part.notesArray.length; j++) {
      const notes = part.notesArray[j];
      const interval = partSize.x / notes.length;
      measurePartCount += 1;
      const grid: Vector2 = { x: measurePartCount % 4, y: Math.floor(measurePartCount / 4) };

      if (grid.y > currentRow) {
        currentRow += 1;
        drawBackground(context, startPos.y, currentRow, partSize.y, canvas.width, partSpace);
      }
      drawLine(context, startPos, partSize, grid, partSpace);

      for (let k = 0; k < notes.length; k++) {
        const notePos: Vector2 = {
          x: startPos.x + grid.x * partSize.x + k * interval,
          y: startPos.y + grid.y * (partSize.y + partSpace) + partSize.y / 2,
        };

        switch (notes[k]) {
          case 1:
            drawNote(context, notePos, "don");
            break;
          case 2:
            drawNote(context, notePos, "ka");
            break;
          case 3:
            drawNote(context, notePos, "don", "big");
            break;
          case 4:
            drawNote(context, notePos, "ka", "big");
            break;
        }
      }
    }
  }
}

function drawBackground(
  context: CanvasRenderingContext2D,
  startY: number,
  row: number,
  partHeight: number,
  canvasWidth: number,
  space: number
) {
  context.save();
  // 黑色边
  context.fillStyle = "black";
  context.fillRect(0, startY + row * (partHeight + space) - 2, canvasWidth, partHeight + 4);

  // 灰色底
  context.fillStyle = "rgb(128,128,128)";
  context.fillRect(0, startY + row * (partHeight + space), canvasWidth, partHeight);

  // 白色内边
  context.fillStyle = "rgb(255,255,255)";
  context.fillRect(0, startY + row * (partHeight + space), canvasWidth, 4);
  context.fillRect(0, startY + row * (partHeight + space) + partHeight - 4, canvasWidth, 4);
  context.restore();
}

function drawLine(
  context: CanvasRenderingContext2D,
  startPos: Vector2,
  partSize: Vector2,
  gridInfo: Vector2,
  space: number
) {
  const beginPos: Vector2 = {
    x: startPos.x + partSize.x * gridInfo.x,
    y: startPos.y + (partSize.y + space) * gridInfo.y - 15,
  };

  const endPos: Vector2 = {
    x: startPos.x + partSize.x * gridInfo.x,
    y: startPos.y + (partSize.y + space) * gridInfo.y + partSize.y,
  };

  context.save();

  // 小节标注
  context.fillStyle = "black";
  context.fillText(`${gridInfo.y * 4 + gridInfo.x + 1}`, beginPos.x + 5, beginPos.y + 10);

  context.lineWidth = 2;
  context.strokeStyle = "white";
  context.beginPath();
  context.moveTo(beginPos.x, beginPos.y);
  context.lineTo(endPos.x, endPos.y);
  context.stroke();
  context.closePath();
  context.restore();

  for (let i = 1; i < 8; i++) {
    context.save();
    if (i % 2 === 0) {
      context.strokeStyle = "rgb(191,191,191)";
    } else {
      context.strokeStyle = "rgb(159,159,159)";
    }

    const subBeginPos: Vector2 = {
      x: startPos.x + partSize.x * gridInfo.x + (partSize.x / 8) * i,
      y: startPos.y + (partSize.y + space) * gridInfo.y + 4,
    };

    const subEndPos: Vector2 = {
      x: startPos.x + partSize.x * gridInfo.x + (partSize.x / 8) * i,
      y: startPos.y + partSize.y + (partSize.y + space) * gridInfo.y - 4,
    };

    context.beginPath();
    context.moveTo(subBeginPos.x, subBeginPos.y);
    context.lineTo(subEndPos.x, subEndPos.y);
    context.stroke();
    context.closePath();

    context.restore();
  }

  const finalBeginPos: Vector2 = {
    x: startPos.x + partSize.x * (gridInfo.x + 1),
    y: startPos.y + (partSize.y + space) * gridInfo.y,
  };

  const finalEndPos: Vector2 = {
    x: startPos.x + partSize.x * (gridInfo.x + 1),
    y: startPos.y + (partSize.y + space) * gridInfo.y + partSize.y,
  };
  context.save();
  context.lineWidth = 2;
  context.strokeStyle = "white";
  context.beginPath();
  context.moveTo(finalBeginPos.x, finalBeginPos.y);
  context.lineTo(finalEndPos.x, finalEndPos.y);
  context.stroke();
  context.closePath();
  context.restore();
}

function drawNote(
  context: CanvasRenderingContext2D,
  position: Vector2,
  type: "don" | "ka",
  size: "small" | "big" = "small"
) {
  const round = size === "small" ? 8.5 : 11.2;

  // 最外层黑边
  context.save();
  context.beginPath();

  context.fillStyle = "rgb(49,49,49)";
  context.arc(position.x, position.y, round + 2.5, 0, 2 * Math.PI);
  context.fill();

  context.closePath();
  context.restore();

  // 白边
  context.save();
  context.beginPath();

  context.fillStyle = "white";
  context.arc(position.x, position.y, round + 1.5, 0, 2 * Math.PI);
  context.stroke();
  context.fill();

  context.closePath();
  context.restore();

  // 音符
  context.save();
  context.beginPath();

  context.fillStyle = type === "don" ? "rgb(255,66,66)" : "rgb(67,200,255)";
  context.arc(position.x, position.y, size === "small" ? round : round - 0.5, 0, 2 * Math.PI);
  context.fill();

  context.closePath();
  context.restore();
}
