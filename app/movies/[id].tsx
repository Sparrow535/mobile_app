import { icons } from "@/constants/icons";
import { fetchMovieDetails } from "@/services/api";
import { databaseService } from "@/services/database";
import { storageService } from "@/services/storage";
import useFetch from "@/services/useFetch";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const fetchMovie = useCallback(
    () => fetchMovieDetails(id as string),
    [id]
  );
  const { data: movie, loading } = useFetch(fetchMovie);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadReviews = async () => {
    try {
      const res = await databaseService.getReviews(id as string);

      // Enrich each review with user's current avatar (fetched live)
      const withAvatars = await Promise.all(
        (res || []).map(async (rev: any) => {
          try {
            const u = await storageService.getUserById(String(rev.userId));
            return { ...rev, userAvatar: u?.avatar }; // add userAvatar
          } catch {
            return { ...rev, userAvatar: undefined };
          }
        })
      );

      setReviews(withAvatars);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!user) {
        setIsFavorite(false);
        return;
      }

      try {
        setLoadingFavorite(true);
        const favoriteExists = await databaseService.isFavorite(
          user._id,
          id as string
        );
        setIsFavorite(favoriteExists);
      } catch (error) {
        console.error("Error loading favorite status:", error);
        setIsFavorite(false);
      } finally {
        setLoadingFavorite(false);
      }
    };

    loadFavoriteStatus();
  }, [user, id]);

  const submitReview = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to leave a review.");
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert("Error", "Please write a review before submitting.");
      return;
    }

    setSubmittingReview(true);
    try {
      await databaseService.addReview(
        user._id,
        id as string,
        rating,
        reviewText.trim()
      );
      setReviewText("");
      setRating(5);
      await loadReviews();
      Alert.alert("Success", "Review submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to add movies to favorites."
      );
      return;
    }

    setLoadingFavorite(true);
    try {
      const res = await databaseService.toggleFavorite(user._id, {
        id: Number(id),
        title: movie?.title,
        poster_path: movie?.poster_path,
      });

      setIsFavorite(!res.removed);

      if (res.removed) {
        Alert.alert("Removed", "Movie removed from favorites.");
      } else {
        Alert.alert("Added", "Movie added to favorites!");
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorites. Please try again.");
    } finally {
      setLoadingFavorite(false);
    }
  };

  const renderRatingStars = () => {
    return (
      <View className="flex-row items-center gap-x-1 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            disabled={!user}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={24}
              color={star <= rating ? "#FFD700" : "#666"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">Loading movie details...</Text>
      </View>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="cover"
          />
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-2xl">{movie?.title}</Text>

          {/* Favorite Button */}
          <View className="flex-row items-center gap-x-2 mt-3">
            <TouchableOpacity
              onPress={toggleFavorite}
              disabled={loadingFavorite}
              className="px-3 py-2 bg-dark-100 rounded-lg flex-row items-center"
            >
              {loadingFavorite ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? "#ff6b6b" : "#fff"}
                />
              )}
            </TouchableOpacity>
            <Text className="text-light-200">
              {isFavorite ? "Remove from favorites" : "Add to favorites"}
            </Text>
          </View>

          {/* Basic Info */}
          <View className="flex-row items-center gap-x-4 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime} min</Text>
            <View className="flex-row items-center gap-x-1">
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text className="text-light-200 text-sm">
                {movie?.vote_average?.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Movie Details */}
          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g: any) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex-row justify-between w-full mt-4">
            <MovieInfo
              label="Budget"
              value={
                movie?.budget
                  ? `$${(movie.budget / 1_000_000).toFixed(1)}M`
                  : "N/A"
              }
            />
            <MovieInfo
              label="Revenue"
              value={
                movie?.revenue
                  ? `$${(movie.revenue / 1_000_000).toFixed(1)}M`
                  : "N/A"
              }
            />
          </View>

          {/* Reviews Section */}
          <View className="mt-8 w-full">
            <Text className="text-white font-bold text-xl mb-4">Reviews</Text>

            {/* Review Input */}
            <View className="mt-3">
              {user ? (
                <>
                  <TextInput
                    value={reviewText}
                    onChangeText={setReviewText}
                    placeholder="Share your thoughts about this movie..."
                    placeholderTextColor="#999"
                    className="bg-dark-100 text-white p-4 rounded-lg text-base"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  {renderRatingStars()}

                  <View className="flex-row items-center justify-between mt-4">
                    <Text className="text-light-200">
                      {reviewText.length}/500 characters
                    </Text>
                    <TouchableOpacity
                      className="bg-accent px-6 py-3 rounded-lg"
                      onPress={submitReview}
                      disabled={submittingReview || !reviewText.trim()}
                    >
                      {submittingReview ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white font-semibold">
                          Submit Review
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View className="bg-dark-100 p-4 rounded-lg">
                  <Text className="text-light-200 text-center">
                    Please log in to leave a review.
                  </Text>
                </View>
              )}
            </View>

            {/* Reviews List */}
            <View className="mt-6 space-y-4">
              <Text className="text-white font-semibold text-lg">
                User Reviews ({reviews.length})
              </Text>

              {reviews.length === 0 ? (
                <View className="bg-dark-100 p-6 rounded-lg">
                  <Text className="text-light-200 text-center">
                    No reviews yet. Be the first to share your thoughts!
                  </Text>
                </View>
              ) : (
                reviews.map((review) => (
                  <View
                    key={review._id || review.$id}
                    className="bg-dark-100 p-4 rounded-lg flex-row"
                  >
                    {/*Avater*/}
                    <Image
                      source={
                        review.userAvatar
                          ? { uri: review.userAvatar }
                          : icons.person
                      }
                      className="w-10 h-10 rounded-full mr-3"
                      resizeMode="cover"
                    />
                    {/* User Info */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-white font-bold text-base">
                          {review.userName || "Anonymous User"}
                        </Text>
                        <View className="flex-row items-center gap-x-1">
                          <Text className="text-accent font-bold">
                            {review.rating}
                          </Text>
                          <Ionicons name="star" size={16} color="#FFD700" />
                        </View>
                      </View>
                      <Text className="text-light-200 text-sm leading-5">
                        {review.text}
                      </Text>

                      <Text className="text-light-300 text-xs mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Go Back Button */}
      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-4 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="w-5 h-5 mr-2 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
