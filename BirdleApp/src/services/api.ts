import axios from 'axios';
import { PlayerBasic, GuessResult } from '../types';

// Update this based on your environment
// For Expo Go on physical device: Use your computer's local IP
// For iOS Simulator: http://localhost:8050
// For Android Emulator: http://10.0.2.2:8050
const API_BASE_URL = 'http://192.168.0.228:8050';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getDailyPlayer = async (): Promise<string> => {
  const response = await api.get('/api/daily-player');
  return response.data.player_id;
};

export const getRandomPlayer = async (): Promise<string> => {
  const response = await api.get('/api/random-player');
  return response.data.player_id;
};

export const searchPlayers = async (query: string): Promise<PlayerBasic[]> => {
  const response = await api.get('/api/search', { params: { q: query } });
  return response.data.players;
};

export const validateGuess = async (
  playerName: string,
  mysteryPlayerId: string
): Promise<GuessResult> => {
  const response = await api.post('/api/validate-guess', {
    player_name: playerName,
    mystery_player_id: mysteryPlayerId,
  });
  return response.data;
};

export interface HintResponse {
  hint_type: string;
  hint_value: string;
  hint_display: string;
}

export const getHint = async (
  playerId: string,
  hintType: 'team' | 'position' | 'jersey'
): Promise<HintResponse> => {
  const response = await api.post('/api/picture-perfect/get-hint', {
    player_id: playerId,
    hint_type: hintType,
  });
  return response.data;
};

export const getPlayerById = async (playerId: string): Promise<any> => {
  const response = await api.get(`/api/player/${playerId}`);
  return response.data;
};
