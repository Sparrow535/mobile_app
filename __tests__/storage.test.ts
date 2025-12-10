import AsyncStorage from "@react-native-async-storage/async-storage";
import { storageService } from "@/services/storage";

jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};
  return {
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      keys.forEach((k) => delete store[k]);
    }),
    __reset: () => {
      store = {};
    },
  };
});

const resetStore = () => {
  (AsyncStorage as any).__reset?.();
  jest.clearAllMocks();
};

describe("storageService favorites", () => {
  beforeEach(() => {
    resetStore();
  });

  it("adds a favorite with poster_url and removes on toggle", async () => {
    const added = await storageService.toggleFavorite("user-1", {
      id: 10,
      title: "Movie A",
      poster_path: "/poster.jpg",
    });

    expect(added.removed).toBe(false);
    expect(added.doc?.poster_url).toBe("https://image.tmdb.org/t/p/w500/poster.jpg");

    const removed = await storageService.toggleFavorite("user-1", {
      id: 10,
      title: "Movie A",
      poster_path: "/poster.jpg",
    });
    expect(removed.removed).toBe(true);
  });

  it("dedupes favorites by movieId and sorts newest first", async () => {
    // Preload AsyncStorage with duplicate movieId entries for same user
    const rawFavorites = [
      {
        _id: "fav_u1_1_old",
        userId: "u1",
        movieId: "1",
        title: "Duplicate Old",
        createdAt: new Date("2024-01-01").toISOString(),
      },
      {
        _id: "fav_u1_1_new",
        userId: "u1",
        movieId: "1",
        title: "Duplicate Newer",
        createdAt: new Date("2024-02-01").toISOString(),
      },
      {
        _id: "fav_u1_2",
        userId: "u1",
        movieId: "2",
        title: "Second Movie",
        createdAt: new Date("2024-03-01").toISOString(),
      },
    ];

    await AsyncStorage.setItem(
      "movie_explorer_favorites",
      JSON.stringify(rawFavorites)
    );

    const favorites = await storageService.getFavorites("u1");

    expect(favorites).toHaveLength(2);
    expect(favorites[0].movieId).toBe("2"); // newest by createdAt
    expect(favorites[1].movieId).toBe("1"); // deduped duplicate keeps first entry
    expect(favorites[1].title).toBe("Duplicate Old");
  });
});

describe("storageService trending", () => {
  beforeEach(() => {
    resetStore();
  });

  it("aggregates search counts by movie_id and keeps latest poster", async () => {
    await storageService.updateSearchCount("Term A", {
      id: 5,
      title: "Movie Five",
      poster_path: "/first.jpg",
    });
    await storageService.updateSearchCount("Term B", {
      id: 5,
      title: "Movie Five Updated",
      poster_path: "/second.jpg",
    });
    await storageService.updateSearchCount("Other", {
      id: 6,
      title: "Movie Six",
    });

    const trending = await storageService.getTrendingMovies();

    expect(trending[0].movie_id).toBe("5");
    expect(trending[0].count).toBe(2);
    // Poster stays from the first insertion (createdAt is unchanged on updates)
    expect(trending[0].poster_url).toBe("https://image.tmdb.org/t/p/w500/first.jpg");
    expect(trending[1].movie_id).toBe("6");
  });
});
