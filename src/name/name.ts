export interface NameObject {
  name: string;
  sentence: string;
  picks: number[];
}

export class Name {
  private name: string;

  private sentence: string;

  private picks: number[];

  private strokes: number[];

  public constructor(name: string, sentence: string, picks: number[]) {
    this.name = name;
    this.sentence = sentence;
    this.picks = picks;
  }

  public toObject(): NameObject {
    const { name, sentence, picks, strokes} = this;
    return {
      name,
      sentence,
      picks,
    }
  }
}
