import { icons } from "@/constants/icons";
import { databaseService } from "@/services/database";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}: Movie) => {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const hasPoster =
    typeof poster_path === "string" && poster_path.trim().length > 0;

  useEffect(() => {
    let mounted = true;
    const loadFavoriteStatus = async () => {
      if (!user) {
        setIsFav(false);
        return;
      }

      try {
        const favoriteExists = await databaseService.isFavorite(
          user._id,
          id.toString()
        );
        if (mounted) {
          setIsFav(favoriteExists);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
        if (mounted) {
          setIsFav(false);
        }
      }
    };

    loadFavoriteStatus();

    return () => {
      mounted = false;
    };
  }, [user, id]);

  const onToggle = async () => {
    if (!user) {
      // You can navigate to login here if needed
      // router.push("/(auth)/login");
      return;
    }

    setSaving(true);
    try {
      const res = await databaseService.toggleFavorite(user._id, {
        id,
        title,
        poster_path,
      });

      if (res.removed) {
        setIsFav(false);
      } else {
        setIsFav(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!hasPoster) {
    // Skip rendering movies without a poster
    return null;
  }

  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity className="w-[30%] mb-4 relative">
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${poster_path}`,
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={onToggle}
          disabled={saving}
          className="absolute top-2 right-2 p-1 bg-black/40 rounded-full"
          style={{ zIndex: 10 }}
        >
          {saving ? (
            <Ionicons name="heart" size={20} color="#ccc" />
          ) : (
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color={isFav ? "#ff6b6b" : "#fff"}
            />
          )}
        </TouchableOpacity>

        {/* Movie Title */}
        <Text className="text-white text-sm font-bold mt-2" numberOfLines={1}>
          {title}
        </Text>

        {/* Rating */}
        <View className="flex-row items-center justify-start gap-x-1 mt-1">
          <Image source={icons.star} className="w-3 h-3" />
          <Text className="text-xs text-white font-bold">
            {vote_average ? (vote_average / 2).toFixed(1) : "N/A"}
          </Text>
        </View>

        {/* Release Year */}
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-xs text-light-300 font-medium">
            {release_date?.split("-")[0] || "Unknown"}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;
