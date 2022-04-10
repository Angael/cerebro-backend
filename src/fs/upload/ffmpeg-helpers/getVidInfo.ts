import { exec } from 'child_process';
import { IS3_video } from '../../../models/IItem';
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

export const getVidInfo = (
  path: string,
): Promise<Pick<IS3_video, 'duration' | 'bitrate' | 'width' | 'height'>> =>
  new Promise((resolve, _reject) => {
    console.log(ffprobePath);
    exec(`${ffprobePath} -hide_banner -i "${path}"`, {}, (_error, _stdout, stderr) => {
      // regexpy na to wszystko
      const durationMatch = stderr.match(/Duration: ([\d:.]+)/);
      const durationString = durationMatch && durationMatch[1];
      // "00:00:15.01"

      const durationInSec = durationString!
        .split(':')
        .reverse()
        .reduce((acc, v, i) => acc + Number(v) * Math.pow(60, i), 0);

      const bitrateMatch = stderr.match(/bitrate: (\d+) ([\w/]+)/);
      const bitrateNum = Number(bitrateMatch && bitrateMatch[1]);
      const bitrateUnit = bitrateMatch && bitrateMatch[2];
      console.log({ bitrateUnit, durationInSec });
      //"kb/s" seems always kb

      // rozdzialka:
      const resMatch = stderr.match(/, (\d+)x(\d+)[\s,]/);
      const w = resMatch && Number(resMatch[1]);
      const h = resMatch && Number(resMatch[2]);

      resolve({
        width: w,
        height: h,
        duration: durationInSec,
        bitrate: bitrateNum * 1000,
      });
    });
  });
