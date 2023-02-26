type Range = [number, number];

export function convertRange(value: number, oldRange: Range, newRange: Range): number {
  return (
    ((value - oldRange[0]) * (newRange[1] - newRange[0])) / (oldRange[1] - oldRange[0]) +
    newRange[0]
  );
}
