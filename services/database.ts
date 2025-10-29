// services/database.ts
import { storageService } from "./storage";

export const databaseService = {
  // Favorites
  async isFavorite(userId: string, movieId: string): Promise<boolean> {
    return await storageService.isFavorite(userId, movieId);
  },

  async getFavoriteDoc(userId: string, movieId: string) {
    return await storageService.getFavoriteDoc(userId, movieId);
  },

  async toggleFavorite(userId: string, movie: any) {
    return await storageService.toggleFavorite(userId, movie);
  },

  async getFavorites(userId: string) {
    return await storageService.getFavorites(userId);
  },

  // Reviews
  async addReview(
    userId: string,
    movieId: string,
    rating: number,
    text: string
  ) {
    return await storageService.addReview(userId, movieId, rating, text);
  },

  async getReviews(movieId: string) {
    return await storageService.getReviews(movieId);
  },

  // Search/Trending
  async updateSearchCount(query: string, movie: any) {
    return await storageService.updateSearchCount(query, movie);
  },

  async getTrendingMovies() {
    return await storageService.getTrendingMovies();
  },
};
