import { Gender } from './enums/Gender';
import { PoetryType } from './enums/PoetryType';
import { BabyName } from './main';

export * from './main';

BabyName.generate({
   source: [PoetryType.SONG_CI, PoetryType.LUN_YU, PoetryType.TANG_SHI, PoetryType.SONG_SHI],
   surname: '王',
   count: 10,
   allowGeneral: false,
   singleNameWeight: 10,
   gender: Gender.COMMON,
});