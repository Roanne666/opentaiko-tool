export type Vector2 = {
  x: number;
  y: number;
};

// ------ 位置/尺寸 ------

/**
 * 绘制起始位置，用于留边
 */
export const startPos: Vector2 = { x: 50, y: 90 };

/**
 * 小节尺寸
 */
export const partSize: Vector2 = { x: 240, y: 35 };

/**
 * 小节每行上下间隔
 */
export const partRowSpace = 45;

// ------ 颜色 ------

/**
 * 音符黑边
 */
export const noteBorder = "rgb(49,49,49)";

/**
 * 咚音符的颜色
 */
export const donColor = "rgb(255,66,66)";

/**
 * 咔音符的颜色
 */
export const kaColor = "rgb(67,200,255)";

/**
 * 黄条颜色
 */
export const yellowColor = "rgb(255,239,67)";

/**
 * 气球颜色
 */
export const balloonColor = "rgb(255,191,67)";

/**
 * 亮色竖线
 */
export const lightLineColor = "rgb(191,191,191)";

/**
 * 暗色竖线
 */
export const drakLineColor = "rgb(159,159,159)";

/**
 * 谱面背景色
 */
export const beatmapBackgroundColor = "rgb(204,204,204)";

/**
 * 小节背景色
 */
export const partBackgroundColor = "rgb(128,128,128)";

// ------ 尺寸 ------

/**
 * 小音符的尺寸
 */
export const smallNoteSize = 8.3;

/**
 * 大音符的尺寸
 */
export const BigNoteSize = 11;

// ------ 字体 ------
export const fontfamily = ' "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';

/**
 * 歌曲名称字体
 */
export const songNameFont = `normal bold 20px ${fontfamily}`;

/**
 * 难度字体
 */
export const difficultyFont = `normal bold 18px ${fontfamily}`;

/**
 * 等级字体
 */
export const levelFont = `normal bold 24px ${fontfamily}`;

/**
 * 标注小节，bpm和scroll等内容的字体
 */
export const markFont = `normal 11px ${fontfamily}`;
