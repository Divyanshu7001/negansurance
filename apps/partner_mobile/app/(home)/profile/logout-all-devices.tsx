import { useClerk } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, useColorScheme, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useServerUser } from "@/context/server-user-context";

type ThemeTokens = {
  primary: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  error: string;
  errorContainer: string;
};

const LIGHT: ThemeTokens = {
  primary: "#753eb5",
  surface: "#fff3fe",
  surfaceContainerLow: "#fdebff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#3d2549",
  onSurfaceVariant: "#6c5279",
  outlineVariant: "#c2a2ce",
  error: "#b41340",
  errorContainer: "#f74b6d",
};

const DARK: ThemeTokens = {
  primary: "#c799ff",
  surface: "#130b1a",
  surfaceContainerLow: "#190f21",
  surfaceContainerLowest: "#000000",
  onSurface: "#f6e6fd",
  onSurfaceVariant: "#b4a6bc",
  outlineVariant: "#4f4456",
  error: "#ff6e84",
  errorContainer: "#a70138",
};

export default function LogoutAllDevicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? DARK : LIGHT;
  const clerk = useClerk();
  const { clear } = useServerUser();

  const [busy, setBusy] = useState(false);

  const action = () => {
    Alert.alert(
      "Log out everywhere?",
      "This will end your sessions on other devices. You may also be logged out on this device depending on your Clerk configuration.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              // Best-effort: Clerk JS supports different options across SDK versions.
              const anyClerk = clerk as any;
              if (typeof anyClerk?.signOut === "function") {
                // Try an "all sessions" style hint first; fall back to normal sign-out.
                try {
                  await anyClerk.signOut({ signOutAll: true });
                } catch {
                  await anyClerk.signOut();
                }
              }

              await clear();

              router.replace("/");
            } catch (e: any) {
              const msg =
                typeof e?.message === "string"
                  ? e.message
                  : "Failed to sign out.";
              Alert.alert("Couldn’t log out", msg);
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={[]}
    >
      <View
        style={{ paddingTop: Math.max(insets.top, 0) }}
        className="px-6 pb-4 pt-3"
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={colors.onSurface}
            />
          </Pressable>
          <Text
            className="font-headline text-xl tracking-tight"
            style={{ color: colors.onSurface }}
          >
            Log Out
          </Text>
        </View>
        <Text
          className="mt-2 font-body"
          style={{ color: colors.onSurfaceVariant }}
        >
          End sessions on other devices.
        </Text>
      </View>

      <View className="flex-1 px-6 pt-6">
        <View
          style={{
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: `${colors.errorContainer}22`,
          }}
          className="p-6"
        >
          <View className="flex-row items-start gap-4">
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.errorContainer}22` }}
            >
              <MaterialIcons name="logout" size={22} color={colors.error} />
            </View>
            <View className="flex-1">
              <Text
                className="font-headline text-lg font-bold"
                style={{ color: colors.onSurface }}
              >
                Log Out of All Devices
              </Text>
              <Text
                className="mt-2 font-body text-sm"
                style={{ color: colors.onSurfaceVariant }}
              >
                For safety, we’ll attempt to revoke sessions across devices. If
                your Clerk plan or configuration doesn’t support it, this will
                still log you out on this device.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={action}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Log out of all devices"
            className="mt-6 items-center justify-center rounded-full px-6 py-4"
            style={{ backgroundColor: colors.errorContainer }}
          >
            <Text
              className="font-headline text-base font-bold"
              style={{ color: isDark ? "#130b1a" : "#510017" }}
            >
              {busy ? "Working…" : "Log Out"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
