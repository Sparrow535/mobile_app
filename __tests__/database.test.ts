import { databaseService } from "@/services/database";
import { storageService } from "@/services/storage";

jest.mock("@/services/storage", () => ({
  storageService: {
    isFavorite: jest.fn(),
    getFavoriteDoc: jest.fn(),
    toggleFavorite: jest.fn(),
    getFavorites: jest.fn(),
    addReview: jest.fn(),
    getReviews: jest.fn(),
    updateSearchCount: jest.fn(),
    getTrendingMovies: jest.fn(),
    storeSession: jest.fn(),
    getStoredSession: jest.fn(),
    clearSession: jest.fn(),
  },
}));

describe("databaseService proxies to storageService", () => {
  it("checks favorite status", async () => {
    (storageService.isFavorite as jest.Mock).mockResolvedValue(true);
    const result = await databaseService.isFavorite("u1", "m1");
    expect(result).toBe(true);
    expect(storageService.isFavorite).toHaveBeenCalledWith("u1", "m1");
  });

  it("adds and gets reviews", async () => {
    (storageService.addReview as jest.Mock).mockResolvedValue({ ok: true });
    await databaseService.addReview("u1", "m1", 4, "Nice movie");
    expect(storageService.addReview).toHaveBeenCalledWith("u1", "m1", 4, "Nice movie");

    (storageService.getReviews as jest.Mock).mockResolvedValue([{ id: "r1" }]);
    const reviews = await databaseService.getReviews("m1");
    expect(reviews).toEqual([{ id: "r1" }]);
    expect(storageService.getReviews).toHaveBeenCalledWith("m1");
  });

  it("updates search count and fetches trending movies", async () => {
    await databaseService.updateSearchCount("term", { id: "1", title: "Movie" });
    expect(storageService.updateSearchCount).toHaveBeenCalledWith("term", { id: "1", title: "Movie" });

    (storageService.getTrendingMovies as jest.Mock).mockResolvedValue([{ movie_id: "1" }]);
    const trending = await databaseService.getTrendingMovies();
    expect(trending).toEqual([{ movie_id: "1" }]);
  });
});
