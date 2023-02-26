import { CompressionOptions } from '@vanih/dunes-node';
import { convertRange } from '../../utils/convertRange.js';

type VideoStats = {
  width: number;
  height: number;
  size: number; //bytes
  bitrateKb: number;
};

type DecideSettings = CompressionOptions & {
  shouldCompress: boolean;
};

const p720 = 720 * 1280;

export function decideSettings(video: VideoStats): DecideSettings {
  let newWidth: number = video.width;
  let newHeight: number = video.height;
  if (p720 < video.width * video.height) {
    const howMuchSmaller = Math.sqrt((720 * 1280) / (video.width * video.height));
    newWidth *= howMuchSmaller;
    newHeight *= howMuchSmaller;
  }

  let maxBitrateKbs: number = 700;
  if (newWidth * newHeight < p720) {
    maxBitrateKbs = convertRange(newWidth * newHeight, [0, p720], [100, maxBitrateKbs]);
  }

  let crf = 45;
  if (video.size < 100_000) {
    crf = Math.round(convertRange(video.size, [0, 100_000], [39, crf]));
  }

  const shouldCompress = maxBitrateKbs < video.bitrateKb * 0.9;

  return {
    shouldCompress,
    width: newWidth,
    height: newHeight,
    bitrateKbs: maxBitrateKbs,
    crf: crf as any,
  };
}
