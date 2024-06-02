export type BeatmapPart = {
  bpmChange?: number;
  scroll: number;
  measure: [number, number];
  gogoTime: boolean;
  notes: number[][];
  barline: boolean;
};

export function parseBeatmap(lines: string[], start: number) {
  const beatmap: BeatmapPart[] = [];
  let end = start;
  let barline = true;

  for (let i = start; i < lines.length - 1; i++) {
    const line = lines[i].toLowerCase().trim();
    if (line.includes("#end")) break;

    if (line.includes("#")) {
      const { end, beatmapPart } = parseBeatmapPart(lines, i, barline);
      beatmap.push(beatmapPart);
      barline = beatmapPart.barline;
      i = end;
    }
  }

  return { end, beatmap };
}

function parseBeatmapPart(lines: string[], start: number, barline: boolean): { end: number; beatmapPart: BeatmapPart } {
  let partStart = false;

  const beatmapPart: BeatmapPart = {
    scroll: 1,
    bpmChange: 0,
    measure: [4, 4],
    gogoTime: false,
    barline,
    notes: [],
  };
  for (let i = start; i < lines.length - 1; i++) {
    const line = lines[i].toLowerCase().trim();

    if (partStart) {
      if (line.includes("#")) {
        return { end: i, beatmapPart };
      }
      if (line.includes(",")) {
        beatmapPart.notes.push(
          line
            .split(",")[0]
            .split("")
            .map((s) => Number(s))
        );
      }
    } else {
      if (line.includes(",")) {
        partStart = true;
        beatmapPart.notes.push(
          line
            .split(",")[0]
            .split("")
            .map((s) => Number(s))
        );
      }
      if (line.includes("#scroll")) beatmapPart.scroll = Number(line.split(" ")[1]);
      if (line.includes("#bpmchange")) beatmapPart.bpmChange = Number(line.split(" ")[1]);
      if (line.includes("#measure")) {
        const measureStrings = line.split(" ")[1].split("/");
        beatmapPart.measure = [Number(measureStrings[0]), Number(measureStrings[1])];
      }
      if (line.includes("#gogostart")) beatmapPart.gogoTime = true;
      if (line.includes("#barlineoff")) beatmapPart.barline = false;
      if (line.includes("#barlineon")) beatmapPart.barline = true;
    }
  }
  return { end: lines.length - 1, beatmapPart };
}
