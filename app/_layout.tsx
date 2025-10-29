// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movies/[id]" />
      </Stack>
    </AuthProvider>
  );
}
