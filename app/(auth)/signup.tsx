// app/(auth)/signup.tsx
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
const isStrongEnough = (pwd: string) =>
  pwd.length >= 8 && /[A-Za-z]/.test(pwd) && /\d/.test(pwd);

export default function Signup() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    // Client-side validations
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const pwd = password;

    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter your full name (min 2 characters).");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isStrongEnough(pwd)) {
      setError(
        "Password must be at least 8 characters and include letters and numbers."
      );
      return;
    }
    if (pwd !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register(trimmedEmail, pwd, trimmedName);
      // ✅ After successful signup, go to Login
      Alert.alert("Account created", "Please sign in to continue.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push("/(auth)/login");
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
                Welcome to Movie Explorer
              </Text>
              <Text className="text-light-200 mt-2">Sign up to continue</Text>
            </View>

            <View className="space-y-4 w-[90%] mx-auto gap-3">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#999"
                className="bg-dark-100 p-3 rounded-md text-white"
                autoCapitalize="words"
              />
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
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm password"
                placeholderTextColor="#999"
                secureTextEntry
                className="bg-dark-100 p-3 rounded-md text-white"
              />

              {/* Inline helper text (optional) */}
              <Text className="text-light-300 text-xs">
                Password must be at least 8 characters and include letters and
                numbers.
              </Text>

              {error ? <Text className="text-red-400">{error}</Text> : null}

              <TouchableOpacity
                onPress={onSubmit}
                className="bg-accent p-3 rounded-md items-center"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">
                    Create account
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-2">
                <Text className="text-light-200">Already have an account?</Text>
                <TouchableOpacity onPress={navigateToLogin} className="ml-2">
                  <Text className="text-accent font-semibold">Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
