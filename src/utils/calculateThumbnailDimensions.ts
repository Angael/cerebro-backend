import { IThumbnailMeasure } from '../models/IThumbnail.js';
import { MD_CELL_SIZE, XS_CELL_SIZE } from './consts.js';
import { ThumbnailType } from '@prisma/client';

const resizeWithSameAspectRatio = (_w: number, _h: number, desiredPxAmount: number) => {
  const x = desiredPxAmount / (_w * _h);
  const width = Math.round(_w * Math.pow(x, 0.5));
  const height = Math.round(_h * Math.pow(x, 0.5));

  if (_w < width || _h < width) {
    return { width: _w, height: _h };
  }
  return { width, height };
};

export const calculateThumbnailDimensions = (w: number, h: number): IThumbnailMeasure[] => {
  const howWide = w / h;

  const allowedPixelsModifier: number =
    (howWide >= 1.35 && w >= 2 * MD_CELL_SIZE && h >= MD_CELL_SIZE) ||
    (howWide <= 0.75 && w >= MD_CELL_SIZE && h >= 2 * MD_CELL_SIZE)
      ? 2
      : 1;

  const arr: IThumbnailMeasure[] = [];
  arr.push({
    type: ThumbnailType.MD,
    ...resizeWithSameAspectRatio(w, h, allowedPixelsModifier * MD_CELL_SIZE * MD_CELL_SIZE),
  });
  arr.push({
    type: ThumbnailType.XS,
    ...resizeWithSameAspectRatio(w, h, allowedPixelsModifier * XS_CELL_SIZE * XS_CELL_SIZE),
  });

  return arr;
};
