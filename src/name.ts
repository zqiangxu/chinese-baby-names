import { getStrokeNumber } from './utils/stoke';
import { traditionalToSimplified } from './utils/convert';

function hash(str: string): number {
  let hash = 0;
  if (str.length == 0) return hash;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export class Name {
  public first_name: string;
  public stroke_number1: number;
  public stroke_number2: number;
  public count: number;
  public source: string;
  public gender: string;

  constructor(first_name: string, source: string, gender: string) {
    this.stroke_number1 = getStrokeNumber(first_name[0]);
    this.stroke_number2 = getStrokeNumber(first_name[1]);
    this.count = first_name.length;
    this.source = source.replace(first_name[0],  `「${first_name[0]}」`   )
                          .replace(first_name[1],   `「${first_name[1]}」`   );
    this.gender = gender;
    this.first_name = traditionalToSimplified(first_name);
  }

  public equals(other: Name): boolean {
    return this.first_name === other.first_name;
  }

  public notEquals(other: Name): boolean {
    return !this.equals(other);
  }

  public lessThan(other: Name): boolean {
    return this.first_name < other.first_name;
  }

  public toString(): string {
    return `${this.first_name}\t${this.gender}\t${this.first_name[0]}\t${this.first_name[1]}\t${this.stroke_number1}\t${this.stroke_number2}\t${this.source}`;
  }

  public hash(): number {
    return hash(this.first_name);
  }
}
