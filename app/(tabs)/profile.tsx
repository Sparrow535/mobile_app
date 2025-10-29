// app/(tabs)/profile.tsx
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { authService } from "@/services/auth";
import { storageService } from "@/services/storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
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

const Profile = () => {
  const { user, profile, loading, signout, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [avatar, setAvatar] = useState<string | undefined>(
    profile?.avatar ?? undefined
  );
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setAvatar(profile.avatar ?? undefined);
    }
  }, [profile]);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (res.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant camera roll permissions to change your avatar."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setAvatar(uri);

        // For MongoDB, we'll store the image locally or use a service like Cloudinary
        // For now, we'll just update the local state and save the URI
        // In a production app, you'd upload to a cloud storage service
        setUploadingAvatar(true);
        try {
          await updateProfile({ avatar: uri });
          Alert.alert("Success", "Avatar updated successfully");
        } catch (error: any) {
          console.error("Avatar update error:", error);
          Alert.alert("Error", "Failed to update avatar");
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const onSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      await updateProfile({ name, email, avatar });
      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      console.error("Profile update error:", err);
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signout();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Logout failed");
          }
        },
      },
    ]);
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">Loading profile...</Text>
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

      {/* ✅ Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 24,
          paddingTop: 80,
          paddingBottom: 120, // give space for reset button visibility
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View className="items-center">
          <TouchableOpacity
            onPress={pickImage}
            disabled={uploadingAvatar}
            className="items-center"
          >
            {uploadingAvatar ? (
              <View className="w-28 h-28 rounded-full bg-dark-100 justify-center items-center">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <Image
                source={avatar ? { uri: avatar } : icons.person}
                className="w-28 h-28 rounded-full"
                resizeMode="cover"
              />
            )}
            <Text className="text-accent mt-3">
              {uploadingAvatar ? "Uploading..." : "Change avatar"}
            </Text>
          </TouchableOpacity>

          <View className="mt-4 items-center">
            <Text className="text-white text-xl font-bold">
              {profile?.name || user?.name || "User"}
            </Text>
            <Text className="text-light-200 mt-1">
              {profile?.email || user?.email}
            </Text>
            <Text className="text-light-300 text-sm mt-2">
              Member since{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "recently"}
            </Text>
          </View>
        </View>

        {/* Profile Form */}
        <View className="mt-8 space-y-4">
          {/* Name */}
          <View>
            <Text className="text-light-200 text-base font-medium mb-2">
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="bg-dark-100 p-4 rounded-lg text-white text-base"
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Email */}
          <View>
            <Text className="text-light-200 text-base font-medium mb-2">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="bg-dark-100 p-4 rounded-lg text-white text-base"
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Text className="text-light-300 text-xs mt-1">
              Email cannot be changed
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={onSave}
            className="bg-accent p-4 rounded-lg items-center mt-6"
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Save Profile
              </Text>
            )}
          </TouchableOpacity>

          {/* Account Info */}
          <View className="bg-dark-100 p-4 rounded-lg mt-6">
            <Text className="text-white font-semibold text-lg mb-3">
              Account Information
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-light-200">User ID</Text>
                <Text className="text-light-300 text-xs">
                  {user?._id?.substring(0, 8)}...
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-light-200">Account Created</Text>
                <Text className="text-light-300">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 p-4 rounded-lg items-center mt-6"
          >
            <Text className="text-white font-semibold text-base">Logout</Text>
          </TouchableOpacity>

          {/* ✅ Danger Zone (Reset Local Database) */}
          <View className="bg-dark-100 p-4 rounded-lg mt-6 border border-red-500/40">
            <Text className="text-white font-semibold text-lg mb-3">
              Danger Zone
            </Text>
            <Text className="text-light-300 text-sm mb-4">
              This will erase all local data (users, session, favorites,
              reviews, searches).
            </Text>

            <TouchableOpacity
              onPress={async () => {
                Alert.alert(
                  "Reset app data?",
                  "This will log you out and remove all local data. Continue?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reset",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await storageService.clearAllData();
                          await authService.logout();
                          setTimeout(() => {
                            Alert.alert(
                              "Done",
                              "All local data has been cleared."
                            );
                          }, 100);
                        } catch (e) {
                          Alert.alert(
                            "Error",
                            "Failed to clear data. Check console."
                          );
                          console.error(e);
                        }
                      },
                    },
                  ]
                );
              }}
              className="bg-red-600 p-4 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-base">
                Reset Local Database
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
