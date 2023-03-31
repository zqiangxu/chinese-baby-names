import { traditionalToSimplified } from "src/utils/opencc";
import { Gender } from "../enums/Gender";

export interface NameObject {
  name: string;
  sentence: string;
  title: string;
  picks: number[];
  gender: Gender,
}

export class Name {
  private name: string;

  private sentence: string;

  /**
   * 来源的诗歌标题
   */
  private title: string;

  private picks: number[];

  private gender: Gender;

  public constructor(name: string, sentence: string, title: string, picks: number[], gender: Gender) {
    this.name = traditionalToSimplified(name);
    this.sentence = traditionalToSimplified(sentence);
    this.picks = picks;
    this.gender = gender;
    this.title = traditionalToSimplified(title);
  }

  public toObject(): NameObject {
    const { name, sentence, picks, gender, title } = this;
    return {
      name,
      sentence,
      title,
      picks,
      gender,
    }
  }
}
