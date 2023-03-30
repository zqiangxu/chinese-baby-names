import { Gender } from '../enums/Gender';

export function convertGender(chineseGender: string): Gender {
  switch (chineseGender.trim()) {
    case '男':
      return Gender.BOY;
    case '女':
      return Gender.GIRL;
    default:
      return Gender.COMMON;
  }
}
