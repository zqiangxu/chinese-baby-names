import { PoetryType } from './enums/PoetryType';
import { BabyName } from './main';

export * from './main';

console.error('generator:');
BabyName.generate({
   source: PoetryType.ZHOU_YI,
   surname: '许',
});