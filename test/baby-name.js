const { BabyName, Gender, PoetryType } = require('../lib/index.js');

const names = BabyName.generate({
  source: [PoetryType.SONG_CI, PoetryType.TANG_SHI, PoetryType.SONG_SHI],
  surname: '王',
  count: 20,
  allowGeneral: false,
  singleNameWeight: 10,
  gender: Gender.BOY,
});

console.log(names);
