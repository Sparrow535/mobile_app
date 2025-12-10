import "react-native-gesture-handler/jestSetup";

// Minimal mocks to keep non-UI tests stable
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

// Silence NativeAnimatedHelper warnings (fallback to virtual if path moves)
try {
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
} catch {
  jest.mock(
    "react-native/Libraries/Animated/NativeAnimatedHelper",
    () => ({}),
    { virtual: true }
  );
}
