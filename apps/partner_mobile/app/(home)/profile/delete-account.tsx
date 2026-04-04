import { useClerk, useUser } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

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

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? DARK : LIGHT;

  const { user } = useUser();
  const clerk = useClerk();

  const email = useMemo(
    () => user?.primaryEmailAddress?.emailAddress ?? "",
    [user?.primaryEmailAddress?.emailAddress],
  );

  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const enabled = confirm.trim().toUpperCase() === "DELETE" && !busy;

  const deleteAccount = async () => {
    if (!user) {
      Alert.alert("Not ready", "User not loaded yet.");
      return;
    }

    Alert.alert(
      "Delete account?",
      "This will permanently remove your account and data. This action can’t be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              const anyUser = user as any;
              if (typeof anyUser?.delete === "function") {
                await anyUser.delete();
              } else {
                throw new Error(
                  "Account deletion is not supported by this Clerk SDK version.",
                );
              }

              try {
                await (clerk as any).signOut?.();
              } catch {
                // Ignore signout errors after deletion.
              }

              router.replace("/");
            } catch (e: any) {
              const msg =
                typeof e?.message === "string"
                  ? e.message
                  : "Failed to delete account.";
              Alert.alert("Couldn’t delete", msg);
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
            Delete Account
          </Text>
        </View>
        <Text
          className="mt-2 font-body"
          style={{ color: colors.onSurfaceVariant }}
        >
          Permanent removal of policy history and coverage.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10"
        contentContainerStyle={{
          paddingBottom: 32 + Math.max(insets.bottom, 0),
        }}
      >
        <View
          className="mt-6 p-6"
          style={{
            borderRadius: 20,
            backgroundColor: isDark
              ? "rgba(167,1,56,0.10)"
              : "rgba(247,75,109,0.10)",
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(167,1,56,0.20)"
              : "rgba(247,75,109,0.20)",
          }}
        >
          <View className="flex-row items-start gap-4">
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? "rgba(167,1,56,0.20)"
                  : "rgba(247,75,109,0.20)",
              }}
            >
              <MaterialIcons
                name="delete-forever"
                size={22}
                color={colors.error}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-headline text-lg font-bold"
                style={{ color: colors.error }}
              >
                Danger Zone
              </Text>
              <Text
                className="mt-2 font-body text-sm"
                style={{ color: colors.onSurfaceVariant }}
              >
                Deleting your account is irreversible. You’ll lose policy
                history, active coverage, and access to this app.
              </Text>
              {email ? (
                <Text
                  className="mt-2 font-body text-sm"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Signed in as {email}
                </Text>
              ) : null}
            </View>
          </View>

          <View
            className="mt-6"
            style={{ height: 1, backgroundColor: `${colors.errorContainer}33` }}
          />

          <Text
            className="mt-6 font-body text-sm"
            style={{ color: colors.onSurfaceVariant }}
          >
            Type DELETE to confirm:
          </Text>

          <View
            className="mt-3 flex-row items-center px-4 py-4"
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: 16,
            }}
          >
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="DELETE"
              placeholderTextColor={`${colors.onSurfaceVariant}99`}
              autoCapitalize="characters"
              style={{
                flex: 1,
                color: colors.onSurface,
                fontSize: 16,
                fontWeight: "800",
                letterSpacing: 2,
              }}
            />
          </View>

          <Pressable
            onPress={deleteAccount}
            disabled={!enabled}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
            className="mt-5 items-center justify-center rounded-full px-6 py-4"
            style={{
              backgroundColor: enabled
                ? colors.errorContainer
                : `${colors.outlineVariant}33`,
            }}
          >
            <Text
              className="font-headline text-base font-bold"
              style={{ color: isDark ? "#130b1a" : "#510017" }}
            >
              {busy ? "Deleting…" : "Delete Account"}
            </Text>
          </Pressable>

          <Text
            className="mt-4 text-xs"
            style={{ color: colors.onSurfaceVariant }}
          >
            If you’re unsure, go back and contact support.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
