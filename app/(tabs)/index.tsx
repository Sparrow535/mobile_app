import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { databaseService } from "@/services/database";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const transformTrendingData = (data: any[]): TrendingMovie[] => {
    if (!Array.isArray(data)) return [];

    return data.map((item) => {
      const movie_id = String(item?.movie_id ?? "");
      const _id = String(item?._id ?? `trend_${movie_id}`);
      const createdAt =
        typeof item?.createdAt === "string"
          ? new Date(item.createdAt).toLocaleDateString()
          : item?.createdAt instanceof Date
            ? item.createdAt.toLocaleDateString()
            : new Date().toLocaleDateString();

      return {
        _id,
        $id: _id,
        searchTerm: item?.searchTerm ?? "",
        movie_id,
        title: item?.title ?? "Untitled",
        count: Number(item?.count ?? 0),
        poster_url:
          item?.poster_url ?? "https://placehold.co/600x400/1a1a1a/ffffff.png",
        createdAt,
      };
    });
  };

  const {
    data: trendingMoviesRaw,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(() => databaseService.getTrendingMovies());

  // Transform the data
  const trendingMovies = transformTrendingData(trendingMoviesRaw || []);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(() =>
    fetchMovies({
      query: "",
    })
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchTrending(), refetchMovies()]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchPress = () => {
    router.push("/search");
  };

  const renderTrendingSection = () => {
    if (trendingLoading) {
      return (
        <View className="h-40 justify-center items-center">
          <ActivityIndicator size="small" color="#fff" />
          <Text className="text-light-200 mt-2">Loading trending...</Text>
        </View>
      );
    }

    if (trendingError) {
      return (
        <View className="h-32 justify-center items-center">
          <Text className="text-red-400 text-center">
            Failed to load trending movies
          </Text>
          <TouchableOpacity
            onPress={refetchTrending}
            className="bg-accent px-4 py-2 rounded mt-2"
          >
            <Text className="text-white text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!trendingMovies || trendingMovies.length === 0) {
      return (
        <View className="h-32 justify-center items-center">
          <Text className="text-light-200 text-center">
            No trending data yet. Start searching for movies!
          </Text>
        </View>
      );
    }

    return (
      <View className="mt-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">Trending Now</Text>
          <Text className="text-light-200 text-sm">
            Based on recent searches
          </Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-4" />}
          data={trendingMovies}
          renderItem={({ item, index }) => (
            <TrendingCard movie={item} index={index} />
          )}
          keyExtractor={(item) => item.movie_id}
        />
      </View>
    );
  };

  const renderLatestMoviesSection = () => {
    if (moviesLoading) {
      return (
        <View className="py-8 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-light-200 mt-4">Loading movies...</Text>
        </View>
      );
    }

    if (moviesError) {
      return (
        <View className="py-8 justify-center items-center">
          <Text className="text-red-400 text-center mb-4">
            Failed to load movies
          </Text>
          <TouchableOpacity
            onPress={refetchMovies}
            className="bg-accent px-4 py-2 rounded"
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!movies || movies.length === 0) {
      return (
        <View className="py-8 justify-center items-center">
          <Text className="text-light-200 text-center">
            No movies available at the moment
          </Text>
        </View>
      );
    }

    return (
      <View className="mt-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">Popular Movies</Text>
          <Text className="text-light-200 text-sm">{movies.length} movies</Text>
        </View>
        <FlatList
          data={movies}
          renderItem={({ item }) => <MovieCard {...item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      >
        {/* Header */}
        <View className="pt-16 pb-6">
          <Image source={icons.logo} className="w-12 h-10 mx-auto mb-4" />
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Movie Explorer
          </Text>
          <Text className="text-light-200 text-center text-base">
            Discover your next favorite movie
          </Text>
        </View>

        {/* Search Bar */}
        <View className="mt-4">
          <SearchBar
            onPress={handleSearchPress}
            placeholder="Search for movies, actors, genres..."
          />
        </View>

        {/* Trending Movies Section */}
        {renderTrendingSection()}

        {/* Latest Movies Section */}
        {renderLatestMoviesSection()}

        {/* Quick Actions */}
        <View className="mt-8 bg-dark-100 rounded-xl p-4">
          <Text className="text-white text-lg font-bold mb-3">
            Quick Actions
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-accent px-4 py-3 rounded-lg flex-1 mr-2"
              onPress={() => router.push("/search")}
            >
              <Text className="text-white text-center font-semibold">
                🔍 Search
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-dark-200 px-4 py-3 rounded-lg flex-1 ml-2"
              onPress={() => router.push("/(tabs)/saved")}
            >
              <Text className="text-white text-center font-semibold">
                💖 Favorites
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
