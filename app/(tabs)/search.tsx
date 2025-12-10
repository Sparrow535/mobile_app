import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { databaseService } from "@/services/database";
import useFetch from "@/services/useFetch";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMoviesForQuery = useCallback(
    () =>
      fetchMovies({
        query: searchQuery,
      }),
    [searchQuery]
  );

  const { data: movies, loading, error, refetch: loadMovies, reset } = useFetch(
    fetchMoviesForQuery,
    false
  );

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadMovies, reset]);

  useEffect(() => {
    if (movies?.length > 0 && movies?.[0]) {
      // Update search count in MongoDB
      databaseService
        .updateSearchCount(searchQuery, movies[0])
        .catch((error) => {
          console.error("Error updating search count:", error);
        });
    }
  }, [movies, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    reset();
  };

  const getSearchResultText = () => {
    if (!searchQuery.trim()) return "";

    if (loading) return "Searching...";
    if (error) return "Search failed";
    if (movies?.length === 0) return "No results found";

    return `Found ${movies?.length} ${movies?.length === 1 ? "result" : "results"} for`;
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "space-between",
          gap: 16,
          marginVertical: 8,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="pb-4">
            {/* Header */}
            <View className="w-full flex-row justify-center mt-16 mb-6">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            {/* Search Bar */}
            <View className="mb-6">
              <SearchBar
                placeholder="Search for a movie..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />

              {/* Clear Search Button */}
              {searchQuery.trim() && (
                <TouchableOpacity
                  onPress={clearSearch}
                  className="absolute right-4 top-4"
                >
                  <Text className="text-accent font-semibold">Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Loading Indicator */}
            {loading && (
              <View className="flex-row justify-center items-center py-4">
                <ActivityIndicator size="large" color="#ab8bff" />
                <Text className="text-light-200 ml-3">Searching movies...</Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View className="bg-red-500/20 p-4 rounded-lg mb-4">
                <Text className="text-red-400 text-center">
                  Error: {error.message}
                </Text>
                <TouchableOpacity
                  onPress={loadMovies}
                  className="bg-red-500 p-2 rounded mt-2"
                >
                  <Text className="text-white text-center font-semibold">
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Search Results Header */}
            {!loading && !error && searchQuery.trim() && (
              <View className="mb-4">
                <Text className="text-white text-lg font-semibold">
                  {getSearchResultText()}
                  {movies?.length > 0 && (
                    <Text className="text-accent">
                      {"\u201c"}
                      {searchQuery}
                      {"\u201d"}
                    </Text>
                  )}
                </Text>

                {/* Quick Stats */}
                {movies && movies.length > 0 && (
                  <Text className="text-light-300 text-sm mt-1">
                    Showing {Math.min(movies.length, 20)} of {movies.length}{" "}
                    movies
                  </Text>
                )}
              </View>
            )}

            {/* Trending Searches Suggestion */}
            {!searchQuery.trim() && !loading && (
              <View className="bg-dark-100 p-4 rounded-lg mb-6">
                <Text className="text-white font-semibold text-lg mb-2">
                  Search Tips
                </Text>
                <Text className="text-light-200 text-sm">
                  • Try searching by movie title{"\n"}• Use specific keywords
                  for better results{"\n"}• Check your spelling if no results
                  appear
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading && !error && searchQuery.trim() ? (
            <View className="flex-1 justify-center items-center py-16">
              <Image
                source={icons.search}
                className="w-16 h-16 mb-4"
                tintColor="#666"
              />
              <Text className="text-white text-xl font-bold text-center mb-2">
                No Movies Found
              </Text>
              <Text className="text-light-200 text-center text-base leading-6">
                We couldn{"'"}t find any movies matching{" "}
                <Text className="text-accent">
                  {"\u201c"}
                  {searchQuery}
                  {"\u201d"}
                </Text>
              </Text>
              <Text className="text-light-300 text-center text-sm mt-4">
                Try different keywords or check your spelling
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          movies && movies.length > 0 ? (
            <View className="py-8">
              <Text className="text-light-300 text-center text-sm">
                {movies.length === 20
                  ? "Showing top 20 results"
                  : "End of results"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
