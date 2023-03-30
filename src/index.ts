import { Gender } from './enums/Gender';
import { PoetryType } from './enums/PoetryType';
import { BabyName } from './main';

export * from './main';

BabyName.generate({
   source: PoetryType.SONG_CI,
   surname: '王',
   count: 4,
   allowGeneral: false,
   singleNameWeight: 10,
   gender: Gender.GIRL,
});