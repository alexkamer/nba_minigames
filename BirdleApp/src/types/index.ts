export type MatchType = 'exact' | 'higher' | 'lower' | 'partial' | 'close' | 'wrong';

export interface PlayerBasic {
  espn_player_id: string;
  display_name: string;
  full_name: string;
  team_abbreviation: string;
  position: string;
}

export interface PlayerFull {
  espn_player_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  display_name: string;
  height: number;
  display_height: string;
  weight: number;
  display_weight: string;
  age: number;
  position: string;
  jersey: number;
  years_experience: number;
  team_id: string;
  team_name: string;
  team_abbreviation: string;
  team_logo: string;
  conference_name: string;
  conference_abbreviation: string;
  division_name: string;
  division_abbreviation: string;
}

export interface AttributeComparison {
  value: string | number;
  match: MatchType;
  logo?: string;
}

export interface GuessComparison {
  team: AttributeComparison;
  position: AttributeComparison;
  height: AttributeComparison;
  age: AttributeComparison;
  jersey: AttributeComparison;
  division: AttributeComparison;
  experience: AttributeComparison;
}

export interface GuessResult {
  player: PlayerFull;
  comparison: GuessComparison;
  is_correct: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: { [key: number]: number }; // 1-8 guesses
  lastPlayedDate: string;
}
