interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingMovie {
  _id: string;
  searchTerm: string;
  movie_id: string;
  title: string;
  count: number;
  poster_url?: string;
  createdAt: string;
  $id?: string; // Legacy compatibility
}

interface UserDocument {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  password: string;
}

interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}

interface FavoriteDocument {
  _id: string;
  userId: string;
  movieId: string;
  title: string;
  poster_url?: string;
  createdAt: Date;
}

interface ReviewDocument {
  _id: string;
  userId: string;
  movieId: string;
  rating: number;
  text: string;
  createdAt: Date;
  userName?: string;
}

interface SearchDocument {
  _id: string;
  searchTerm: string;
  movie_id: string;
  count: number;
  title: string;
  poster_url?: string;
  createdAt: Date;
}

// Session and Auth interfaces
interface SessionUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Realm-specific interfaces for query results
interface RealmResults<T> {
  length: number;
  [index: number]: T;
  filtered(query: string, ...args: any[]): RealmResults<T>;
  sorted(field: string, reverse?: boolean): RealmResults<T>;
}

// Additional utility interfaces
interface AuthContextType {
  user: SessionUser | null;
  profile: UserDocument | null;
  loading: boolean;
  error: string | null;
  signin: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<UserDocument>) => Promise<void>;
}

// Movie Card Props
interface MovieCardProps {
  id: number;
  poster_path: string;
  title: string;
  vote_average: number;
  release_date: string;
}

// Search Bar Props
interface SearchBarProps {
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}
