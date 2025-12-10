import { images } from "@/constants/images";
import MaskedView from "@react-native-masked-view/masked-view";
import { Link } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const TrendingCard = ({ movie, index }: TrendingCardProps) => {
  // Handle both MongoDB and Appwrite formats
  const movieId = movie.movie_id || movie._id?.toString() || "";
  const title = movie.title || "Unknown Title";
  const hasPoster =
    typeof movie.poster_url === "string" && movie.poster_url.trim().length > 0;
  const posterUrl = hasPoster ? movie.poster_url : null;
  const searchCount = Number(movie.count || 0);

  if (!hasPoster || !posterUrl) {
    return null;
  }

  return (
    <Link href={`/movies/${movieId}`} asChild>
      <TouchableOpacity className="w-36 relative">
        {/* Movie Poster */}
        <Image
          source={{ uri: posterUrl }}
          className="w-36 h-52 rounded-xl"
          resizeMode="cover"
        />

        {/* Ranking Badge */}
        <View className="absolute -top-2 -left-2">
          <MaskedView
            maskElement={
              <Text className="font-bold text-white text-3xl">
                #{index + 1}
              </Text>
            }
          >
            <Image
              source={images.rankingGradient}
              className="w-12 h-12"
              resizeMode="cover"
            />
          </MaskedView>
        </View>

        {/* Search Count Badge */}
        {searchCount > 0 && (
          <View className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">
              {searchCount} {searchCount === 1 ? "search" : "searches"}
            </Text>
          </View>
        )}

        {/* Movie Title */}
        <View className="mt-3">
          <Text
            className="text-white text-sm font-bold leading-5"
            numberOfLines={2}
          >
            {title}
          </Text>

          {/* Additional Info */}
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-light-300 text-xs">Trending</Text>
            <Text className="text-accent text-xs font-semibold">
              #{index + 1}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default TrendingCard;
