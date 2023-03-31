import { Gender } from './enums/Gender';
import { PoetryType } from './enums/PoetryType';
import { BabyName } from './main';

export * from './main';

BabyName.generate({
   source: [PoetryType.SONG_CI, PoetryType.TANG_SHI, PoetryType.SONG_SHI],
   surname: '王',
   count: 20,
   allowGeneral: false,
   singleNameWeight: 10,
   gender: Gender.COMMON,
});