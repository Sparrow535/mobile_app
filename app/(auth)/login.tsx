// app/(auth)/login.tsx
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const { signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      await signin(email.trim(), password);
      // Navigation handled by auth context
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to signup using router (similar to tab navigation)
  const navigateToSignup = () => {
    // relative works inside the same segment or use absolute to be explicit
    router.push("/(auth)/signup");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6">
          <Image source={images.bg} className="absolute w-[100vw] h-full z-0" />
          <View className="flex-1 justify-center">
            {/* Header */}
            <View className="items-center mb-8">
              <Image source={icons.logo} className="w-16 h-14 mb-4" />
              <Text className="text-white text-2xl font-bold">
                Welcome back
              </Text>
              <Text className="text-light-200 mt-2">Sign in to continue</Text>
            </View>

            <View className="space-y-4 gap-3 w-[90%] mx-auto">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-dark-100 p-3 rounded-md text-white"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                className="bg-dark-100 p-3 rounded-md text-white"
              />

              {error ? <Text className="text-red-400">{error}</Text> : null}

              <TouchableOpacity
                onPress={onSubmit}
                className="bg-accent p-3 rounded-md items-center"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Navigation to Signup - Using router like tabs */}
              <View className="flex-row justify-center mt-2">
                <Text className="text-light-200">
                  {"Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={navigateToSignup} className="ml-2">
                  <Text className="text-accent font-semibold">Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
