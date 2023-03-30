import { shuffle } from './shuffle';

export function numSequenceRandoms(count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(i);
  }
  return shuffle(arr);
}
