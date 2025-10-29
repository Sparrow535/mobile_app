// app/dev/reset.tsx
import { authService } from "@/services/auth";
import { storageService } from "@/services/storage";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function ResetScreen() {
  const onReset = async () => {
    try {
      await storageService.clearAllData();
      await authService.logout();
      Alert.alert("Done", "All local data cleared.");
    } catch (e) {
      Alert.alert("Error", "Failed to clear data.");
      console.error(e);
    }
  };

  return (
    <View className="flex-1 bg-primary justify-center items-center p-6">
      <Text className="text-white text-2xl font-bold mb-4">Reset Local DB</Text>
      <Text className="text-light-200 text-center mb-8">
        Press the button to wipe users, session, favorites, reviews, and
        searches.
      </Text>
      <TouchableOpacity
        onPress={onReset}
        className="bg-red-600 px-6 py-4 rounded-lg"
      >
        <Text className="text-white font-semibold">Reset Now</Text>
      </TouchableOpacity>
    </View>
  );
}
