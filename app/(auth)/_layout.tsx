// app/(auth)/_layout.tsx
import { icons } from "@/constants/icons";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

// Optional: Create a header component similar to your tab icons
const AuthHeader = ({ title }: { title: string }) => (
  <View className="items-center mb-8">
    <Image source={icons.logo} className="w-16 h-14 mb-4" />
    <Text className="text-white text-2xl font-bold">{title}</Text>
  </View>
);

export default function AuthLayout() {
  const { user, loading } = useAuth();

  // While deciding, keep a blank stack (no flicker)
  if (loading) return <Stack screenOptions={{ headerShown: false }} />;

  // If logged in, boot them to tabs
  if (user) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
