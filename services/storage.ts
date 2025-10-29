import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------- TYPES ----------
const STORAGE_KEYS = {
  USERS: "movie_explorer_users",
  FAVORITES: "movie_explorer_favorites",
  REVIEWS: "movie_explorer_reviews",
  SEARCHES: "movie_explorer_searches",
  SESSION: "movie_explorer_session",
};

export interface User {
  _id: string;
  email: string;
  name: string;
  password: string;
  avatar?: string;
  createdAt: string; // ISO string
}

export interface Favorite {
  _id: string;
  userId: string;
  movieId: string;
  title: string;
  poster_url?: string;
  createdAt: string; // ISO string
}

export interface Review {
  _id: string;
  userId: string;
  movieId: string;
  rating: number;
  text: string;
  createdAt: string; // ISO
  userName?: string;
}

export interface Search {
  _id: string;
  searchTerm: string;
  movie_id: string;
  count: number;
  title: string;
  poster_url?: string;
  createdAt: string; // ISO
}

// ---------- TOP-LEVEL HELPERS (OUTSIDE THE CLASS!) ----------
function sanitizeFavorite(raw: any): Favorite {
  const userId = String(raw?.userId ?? "");
  const movieId = String(raw?.movieId ?? "");
  const _id = String(raw?._id ?? `fav_${userId}_${movieId}`);
  const title = String(raw?.title ?? "Unknown Title");
  const poster_url =
    typeof raw?.poster_url === "string" ? raw.poster_url : undefined;
  const createdAt = raw?.createdAt
    ? new Date(raw.createdAt).toISOString()
    : new Date().toISOString();
  return { _id, userId, movieId, title, poster_url, createdAt };
}

// ---------- CLASS ----------
class StorageService {
  // Generic
  private async getItem<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error getting ${key}:`, e);
      return [];
    }
  }

  private async setItem<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error setting ${key}:`, e);
    }
  }

  // Users
  async createUser(userData: Omit<User, "createdAt">): Promise<User> {
    const users = await this.getUsers();
    if (users.find((u) => u.email === userData.email)) {
      throw new Error("User already exists with this email");
    }
    const user: User = { ...userData, createdAt: new Date().toISOString() };
    users.push(user);
    await this.setItem(STORAGE_KEYS.USERS, users);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return this.getItem<User>(STORAGE_KEYS.USERS);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.email === email) ?? null;
  }

  async getUserById(userId: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u._id === userId) ?? null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u._id === userId);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], ...updates };
    await this.setItem(STORAGE_KEYS.USERS, users);
    return users[idx];
  }

  // Favorites
  async getFavoritesAll(): Promise<Favorite[]> {
    const arr = await this.getItem<any>(STORAGE_KEYS.FAVORITES);
    return (arr ?? []).map(sanitizeFavorite);
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    const all = await this.getFavoritesAll();
    const mine = all.filter((f) => f.userId === String(userId));

    // dedupe by movieId
    const seen = new Set<string>();
    const cleaned: Favorite[] = [];
    for (const f of mine) {
      if (seen.has(f.movieId)) continue;
      seen.add(f.movieId);
      cleaned.push(f);
    }

    // one-time migration write-back if deduped
    if (cleaned.length !== mine.length) {
      const others = all.filter((f) => f.userId !== String(userId));
      await this.setItem(STORAGE_KEYS.FAVORITES, [...others, ...cleaned]);
    }

    return cleaned.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async isFavorite(userId: string, movieId: string): Promise<boolean> {
    const favorites = await this.getFavoritesAll();
    return favorites.some(
      (fav) =>
        String(fav.userId) === String(userId) &&
        String(fav.movieId) === String(movieId)
    );
  }

  async getFavoriteDoc(
    userId: string,
    movieId: string
  ): Promise<Favorite | null> {
    const favorites = await this.getFavoritesAll();
    return (
      favorites.find(
        (fav) =>
          String(fav.userId) === String(userId) &&
          String(fav.movieId) === String(movieId)
      ) ?? null
    );
  }

  async toggleFavorite(
    userId: string,
    movie: { id: number | string; title: string; poster_path?: string | null }
  ): Promise<{ removed: boolean; doc?: Favorite }> {
    const favorites = await this.getFavoritesAll();
    const mid = String(movie.id);
    const uid = String(userId);

    const existingIndex = favorites.findIndex(
      (fav) => String(fav.userId) === uid && String(fav.movieId) === mid
    );

    if (existingIndex > -1) {
      favorites.splice(existingIndex, 1);
      await this.setItem(STORAGE_KEYS.FAVORITES, favorites);
      return { removed: true };
    } else {
      const newFavorite: Favorite = {
        _id: `fav_${uid}_${mid}_${Date.now()}`,
        userId: uid,
        movieId: mid,
        title: movie.title,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : undefined,
        createdAt: new Date().toISOString(),
      };
      favorites.push(newFavorite);
      await this.setItem(STORAGE_KEYS.FAVORITES, favorites);
      return { removed: false, doc: newFavorite };
    }
  }

  // ----- Reviews -----
  async addReview(
    userId: string,
    movieId: string,
    rating: number,
    text: string
  ): Promise<Review> {
    const reviews = await this.getReviewsAll();
    const user = await this.getUserById(String(userId));

    const newReview: Review = {
      _id: `review_${userId}_${movieId}_${Date.now()}`,
      userId: String(userId),
      movieId: String(movieId),
      rating,
      text,
      userName: user?.name || "Anonymous",
      createdAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    await this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    return newReview;
  }

  async getReviews(movieId: string): Promise<Review[]> {
    const reviews = await this.getReviewsAll();
    return reviews
      .filter((r) => r.movieId === String(movieId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  // Reviews (unchanged except createdAt as ISO if you update)
  async getReviewsAll(): Promise<Review[]> {
    return this.getItem<Review>(STORAGE_KEYS.REVIEWS);
  }

  // ----- Searches / Trending -----
  private normalizeQuery(q: string): string {
    return String(q ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  async updateSearchCount(
    query: string,
    movie: { id: string | number; title: string; poster_path?: string | null }
  ): Promise<void> {
    const q = this.normalizeQuery(query);
    if (!q || q.length < 2) return; // ignore empty/1-char noise

    const searches = await this.getSearches();
    const idx = searches.findIndex((s) => s.searchTerm === q);

    if (idx > -1) {
      searches[idx].count += 1;
      searches[idx].movie_id = String(movie.id); // keep in sync
      searches[idx].title = movie.title || searches[idx].title;
      searches[idx].poster_url = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : searches[idx].poster_url;
    } else {
      searches.push({
        _id: `search_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        searchTerm: q,
        movie_id: String(movie.id),
        count: 1,
        title: movie.title,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : undefined,
        createdAt: new Date().toISOString(),
      });
    }

    await this.setItem(STORAGE_KEYS.SEARCHES, searches);
  }

  // Return top trending *movies* by aggregating all queries that point to the same movie_id
  async getTrendingMovies(): Promise<Search[]> {
    const searches = await this.getSearches();

    // aggregate by movie_id
    const map = new Map<
      string,
      {
        _id: string;
        searchTerm: string; // last query that pointed to it (for display if you want)
        movie_id: string;
        count: number; // sum across queries
        title: string;
        poster_url?: string;
        createdAt: string; // most recent
      }
    >();

    for (const s of searches) {
      const mid = String(s.movie_id);
      const prev = map.get(mid);
      if (!prev) {
        map.set(mid, {
          _id: `agg_${mid}`,
          searchTerm: s.searchTerm,
          movie_id: mid,
          count: s.count,
          title: s.title,
          poster_url: s.poster_url,
          createdAt: s.createdAt,
        });
      } else {
        prev.count += s.count;
        // keep latest title/poster/createdAt if newer
        if (
          new Date(s.createdAt).getTime() > new Date(prev.createdAt).getTime()
        ) {
          prev.searchTerm = s.searchTerm;
          prev.title = s.title;
          prev.poster_url = s.poster_url;
          prev.createdAt = s.createdAt;
        }
      }
    }

    // sort by aggregated count desc; tie-break by latest
    const aggregated = Array.from(map.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // return top 5 (same shape as Search so your UI keeps working)
    return aggregated.slice(0, 5) as unknown as Search[];
  }

  // Searches, Session, Clear all…
  async getSearches(): Promise<Search[]> {
    return this.getItem<Search>(STORAGE_KEYS.SEARCHES);
  }

  async storeSession(user: any): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  }
  async getStoredSession(): Promise<any> {
    const session = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  }
  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  }
}

export const storageService = new StorageService();
