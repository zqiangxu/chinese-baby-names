import { Gender } from "../enums/Gender";

export interface NameObject {
  name: string;
  sentence: string;
  picks: number[];
  gender: Gender,
}

export class Name {
  private name: string;

  private sentence: string;

  private picks: number[];

  private gender: Gender;

  public constructor(name: string, sentence: string, picks: number[], gender: Gender) {
    this.name = name;
    this.sentence = sentence;
    this.picks = picks;
    this.gender = gender;
  }

  public toObject(): NameObject {
    const { name, sentence, picks, gender } = this;
    return {
      name,
      sentence,
      picks,
      gender,
    }
  }
}
