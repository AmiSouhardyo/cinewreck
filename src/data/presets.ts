import { FavoritePreset } from '../types';

export const FAVORITE_PRESETS: FavoritePreset[] = [
  {
    id: 'scifi',
    name: 'Sci-Fi Mindbenders',
    icon: '🚀',
    movies: ['Inception', 'Interstellar', 'Blade Runner 2049', 'The Dark Knight', 'The Matrix']
  },
  {
    id: 'thrillers',
    name: 'High Octane Thrillers',
    icon: '🔥',
    movies: ['Whiplash', 'No Country for Old Men', 'Drive', 'Se7en', 'Mad Max: Fury Road']
  },
  {
    id: 'indie',
    name: 'Masterpieces',
    icon: '✨',
    movies: ['Everything Everywhere All at Once', 'Arrival', 'Dune: Part Two', 'La La Land', 'The Social Network']
  }
];
