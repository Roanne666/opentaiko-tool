export type BeatmapBar = {
  bpm: number;
  scroll: number;
  measure: [number, number];
  gogoTime: boolean;
  barline: boolean;
  notes: number[];
};

export function parseBeatmap(lines: string[], start: number, songBpm: number) {
  const beatmap: BeatmapBar[] = [];

  let bpm = songBpm;
  let scroll = 1;
  let measure: [number, number] = [4, 4];
  let gogoTime = false;
  let barline = true;

  for (let i = start; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (line.includes("#end")) return { end: i, beatmap };

    if (line.includes("#")) {
      if (line.includes("#scroll")) scroll = Number(line.split(" ")[1]);
      else if (line.includes("#bpmchange")) bpm = Number(line.split(" ")[1]);
      else if (line.includes("#measure")) {
        const measureStrings = line.split(" ")[1].split("/");
        measure = [Number(measureStrings[0]), Number(measureStrings[1])];
      } else if (line.includes("#gogostart")) gogoTime = true;
      else if (line.includes("#barlineoff")) barline = false;
      else if (line.includes("#barlineon")) barline = true;
    } else if (line.includes(",")) {
      const bar: BeatmapBar = { scroll, measure, gogoTime, bpm, barline, notes: [] };
      bar.notes = line
        .split(",")[0]
        .split("")
        .map((s) => Number(s));
      beatmap.push(bar);
    } else if (line.length > 0) {
      const bar: BeatmapBar = { scroll, measure, gogoTime, bpm, barline, notes: [] };
      bar.notes = line
        .split("//")[0]
        .split("")
        .map((s) => Number(s));
      beatmap.push(bar);
    }
  }

  return { end: lines.length, beatmap };
}
