import { MaterialIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LocationGateProps = {
  isRequesting?: boolean;
  onEnable: () => void;
  onExit: () => void;
};

export function LocationGate({
  isRequesting = false,
  onEnable,
  onExit,
}: LocationGateProps) {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-surface-bright"
    >
      <View className="h-16 flex-row items-center px-6">
        <Text className="font-headline text-xl font-bold tracking-tight text-primary">
          Permissions
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-6 py-12"
        bounces={false}
      >
        <View className="items-center">
          <View style={{ width: "100%", maxWidth: 320, aspectRatio: 1 }}>
            <View className="flex-1 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl shadow-black/10">
              <View className="flex-1 items-center justify-center bg-primary/10">
                <View className="absolute inset-0 bg-primary/10" />
                <View className="h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/10">
                  <MaterialIcons name="location-on" size={44} color="#faefff" />
                </View>
              </View>

              <View className="absolute bottom-6 left-6 right-6 flex-row items-center gap-3 rounded-lg bg-surface-container-lowest/90 px-4 py-4">
                <View className="h-2 w-2 rounded-full bg-error" />
                <Text className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  Signal Blocked
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-12 items-center">
            <Text className="px-4 text-center font-headline text-4xl font-extrabold tracking-tighter text-on-surface">
              Location Access Required
            </Text>
            <Text className="mt-6 px-2 text-center text-lg leading-relaxed text-on-surface-variant">
              To calculate your risk level and dynamic insurance premium, we
              need to know your operating zone. Without location access, we
              cannot provide coverage.
            </Text>

            <View className="mt-6 flex-row items-center gap-2 rounded-full bg-surface-container-high px-6 py-2">
              <MaterialIcons name="verified-user" size={14} color="#753eb5" />
              <Text className="text-xs font-bold uppercase tracking-widest text-on-primary-container">
                Secure Data Processing
              </Text>
            </View>
          </View>

          <View className="mt-12 w-full px-4">
            <Pressable
              disabled={isRequesting}
              onPress={onEnable}
              className={`w-full flex-row items-center justify-center rounded-full bg-primary px-12 py-5 ${
                isRequesting ? "opacity-80" : "opacity-100"
              }`}
              accessibilityRole="button"
              accessibilityLabel="Enable Location Access"
              accessibilityState={isRequesting ? { busy: true } : {}}
            >
              {isRequesting ? (
                <View className="flex-row items-center gap-3">
                  <ActivityIndicator color="#faefff" />
                  <Text className="font-headline text-lg font-bold text-on-primary">
                    Enabling…
                  </Text>
                </View>
              ) : (
                <Text className="font-headline text-lg font-bold text-on-primary">
                  Enable Location Access
                </Text>
              )}
            </Pressable>

            <Pressable
              disabled={isRequesting}
              onPress={() => {
                if (isRequesting) return;
                Alert.alert(
                  "Exit App",
                  "The app can’t be used without location.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Exit", style: "destructive", onPress: onExit },
                  ],
                );
              }}
              className="mt-4 w-full items-center justify-center rounded-full border-2 border-primary/20 px-12 py-5"
              accessibilityRole="button"
              accessibilityLabel="Exit App"
            >
              <Text className="font-headline text-lg font-bold text-primary">
                Exit App
              </Text>
            </Pressable>
          </View>

          <Text className="mt-10 max-w-sm text-center text-xs leading-loose text-on-surface-variant/60">
            Negansurance only tracks your location while the app is active and
            you are on a designated gig-trip. We never sell your personal
            movement data.
          </Text>
        </View>
      </ScrollView>

      <View className="px-6 py-10">
        <View className="items-center gap-2">
          <Text className="font-headline text-xl font-black tracking-tighter text-primary/40 opacity-50">
            NEGANSURANCE
          </Text>
          <View className="h-1 w-12 rounded-full bg-primary-container" />
        </View>
      </View>
    </SafeAreaView>
  );
}
