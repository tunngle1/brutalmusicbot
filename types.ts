export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string; // Display format "3:45"
  coverUrl: string;
  genre: string;
  audioUrl?: string;
  audioBlob?: Blob;
  coverBlob?: Blob;
  isLocal?: boolean;
}

export interface Playlist {
  id: string;
  name: string; // Changed from title to match usage
  coverUrl: string;
  trackIds: string[];
  coverBlob?: Blob;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrackId: string | null;
  progress: number;
  volume: number;
}

export enum ViewState {
  HOME = 'home',
  PLAYLISTS = 'playlists',
  FAVORITES = 'favorites',
  RADIO = 'radio',
  LIBRARY = 'library',
  ADMIN = 'admin',
  REFERRAL = 'referral'
}

export type RepeatMode = 'none' | 'all' | 'one';
export type SearchMode = 'all' | 'artist' | 'title';

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  image: string;
  url: string;
}

export interface User {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
  is_premium?: boolean;
  subscription_status?: {
    is_active: boolean;
    expires_at: string | null;
    has_access: boolean;
  };
}
