export interface Guess {
  ab: number[];
  result: string;
  takenCardsTable: string;
  availabilityTable: string;
  nextGuesses: number[][][];
  except: string[];
}
