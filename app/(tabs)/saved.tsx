import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { databaseService } from "@/services/database";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

type FavoriteItem = {
  _id?: string;
  userId: string;
  movieId: string;
  title: string;
  poster_url?: string;
  createdAt?: string | Date;
};

const Saved = () => {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const dedupeFavorites = (list: FavoriteItem[]) => {
    // Map by stable composite key (userId + movieId)
    const map = new Map<string, FavoriteItem>();
    for (const f of list) {
      map.set(`${f.userId}_${f.movieId}`, f);
    }
    return Array.from(map.values());
  };

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const favs = await databaseService.getFavorites(user._id);
      setFavorites(dedupeFavorites(favs || []));
    } catch (error) {
      console.error("Error loading favorites:", error);
      Alert.alert("Error", "Failed to load favorites");
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
  };

  // Load on mount & when user changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Refresh when screen gets focus (coming back from details)
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const navigateToMovie = (movieId: string) => {
    router.push(`/movies/${movieId}`);
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => {
    const created = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : "—";
    const poster =
      item.poster_url || "https://placehold.co/600x400/1a1a1a/ffffff.png";

    return (
      <TouchableOpacity
        className="mx-4 mb-4 bg-dark-100 rounded-lg overflow-hidden"
        onPress={() => navigateToMovie(item.movieId)}
      >
        <View className="flex-row">
          <Image
            source={{ uri: poster }}
            className="w-24 h-36"
            resizeMode="cover"
          />
          <View className="flex-1 p-4 justify-between">
            <Text className="text-white font-bold text-lg" numberOfLines={2}>
              {item.title}
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-light-300 text-sm">Added {created}</Text>
              <View className="bg-accent px-2 py-1 rounded">
                <Text className="text-white text-xs font-semibold">Movie</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Image source={icons.save} className="w-20 h-20 mb-6" tintColor="#666" />
      <Text className="text-white text-xl font-bold text-center mb-3">
        No Favorites Yet
      </Text>
      <Text className="text-light-200 text-center text-base leading-6">
        Movies you add to your favorites will appear here. Start exploring and
        save movies you love!
      </Text>
      <TouchableOpacity
        className="bg-accent px-6 py-3 rounded-lg mt-6"
        onPress={() => router.push("/(tabs)")}
      >
        <Text className="text-white font-semibold text-base">
          Browse Movies
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (authLoading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-primary">
        <Image
          source={images.bg}
          className="flex-1 absolute w-full z-0"
          resizeMode="cover"
        />
        <View className="flex-1 justify-center items-center px-8">
          <Image
            source={icons.save}
            className="w-20 h-20 mb-6"
            tintColor="#666"
          />
          <Text className="text-white text-xl font-bold text-center mb-3">
            Please Log In
          </Text>
          <Text className="text-light-200 text-center text-base leading-6 mb-6">
            You need to be logged in to view your favorite movies.
          </Text>
          <TouchableOpacity
            className="bg-accent px-6 py-3 rounded-lg"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white font-semibold text-base">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      {/* Header */}
      <View className="pt-20 px-6 pb-4">
        <Text className="text-white text-2xl font-bold">My Favorites</Text>
        <Text className="text-light-200 mt-1">
          {favorites.length} {favorites.length === 1 ? "movie" : "movies"} saved
        </Text>
      </View>

      {/* Favorites List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-4">Loading favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          // ✅ Unique, stable key (no more collisions)
          keyExtractor={(item) =>
            `${item._id ?? "noid"}::${item.userId ?? "nouser"}::${String(item.movieId)}`
          }
          renderItem={renderFavoriteItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <View className="px-4 pb-2">
              <Text className="text-light-200 text-sm">
                Pull down to refresh
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Saved;
