import { useUser } from "@clerk/expo";
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
};

const LIGHT: ThemeTokens = {
  primary: "#753eb5",
  surface: "#fff3fe",
  surfaceContainerLow: "#fdebff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#3d2549",
  onSurfaceVariant: "#6c5279",
  outlineVariant: "#c2a2ce",
};

const DARK: ThemeTokens = {
  primary: "#c799ff",
  surface: "#130b1a",
  surfaceContainerLow: "#190f21",
  surfaceContainerLowest: "#000000",
  onSurface: "#f6e6fd",
  onSurfaceVariant: "#b4a6bc",
  outlineVariant: "#4f4456",
};

function splitName(fullName?: string | null) {
  const trimmed = (fullName ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/g);
  if (parts.length === 1) return { firstName: parts[0] ?? "", lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1] ?? "",
  };
}

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? DARK : LIGHT;

  const { user, isLoaded } = useUser();

  const initial = useMemo(() => {
    return {
      ...splitName(user?.fullName),
      email: user?.primaryEmailAddress?.emailAddress ?? "",
      phone: user?.primaryPhoneNumber?.phoneNumber ?? "",
    };
  }, [
    user?.fullName,
    user?.primaryEmailAddress?.emailAddress,
    user?.primaryPhoneNumber?.phoneNumber,
  ]);

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [busy, setBusy] = useState(false);

  const canSave = Boolean(firstName.trim()) && isLoaded && !busy;

  const save = async () => {
    if (!user) return;
    if (!firstName.trim()) {
      Alert.alert("Missing name", "Please enter your first name.");
      return;
    }

    setBusy(true);
    try {
      const anyUser = user as any;
      if (typeof anyUser?.update === "function") {
        await anyUser.update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      } else {
        throw new Error(
          "Profile updates are not supported by this Clerk SDK version.",
        );
      }

      Alert.alert("Saved", "Your personal details were updated.");
      router.back();
    } catch (e: any) {
      const msg =
        typeof e?.message === "string" ? e.message : "Failed to save changes.";
      Alert.alert("Couldn’t save", msg);
    } finally {
      setBusy(false);
    }
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
        <View className="flex-row items-center justify-between">
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
              Personal Details
            </Text>
          </View>

          <Pressable
            onPress={save}
            disabled={!canSave}
            accessibilityRole="button"
            accessibilityLabel="Save"
            className="rounded-full px-5 py-2"
            style={{
              backgroundColor: canSave
                ? colors.primary
                : `${colors.outlineVariant}33`,
            }}
          >
            <Text
              className="font-label text-xs font-bold uppercase tracking-widest"
              style={{ color: isDark ? "#130b1a" : "#faefff" }}
            >
              {busy ? "Saving…" : "Save"}
            </Text>
          </Pressable>
        </View>

        <Text
          className="mt-2 font-body"
          style={{ color: colors.onSurfaceVariant }}
        >
          Update your personal information. Email/phone changes typically
          require verification.
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
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: 20,
          }}
        >
          <Field
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            colors={colors}
          />
          <View className="h-5" />
          <Field
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            colors={colors}
          />

          <View
            className="mt-6"
            style={{ height: 1, backgroundColor: `${colors.outlineVariant}33` }}
          />

          <View className="mt-6">
            <Text
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: colors.onSurfaceVariant }}
            >
              Email Address
            </Text>
            <Text
              className="mt-1 font-body font-semibold"
              style={{ color: colors.onSurface }}
            >
              {initial.email || "—"}
            </Text>
          </View>

          <View className="mt-6">
            <Text
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: colors.onSurfaceVariant }}
            >
              Phone Number
            </Text>
            <Text
              className="mt-1 font-body font-semibold"
              style={{ color: colors.onSurface }}
            >
              {initial.phone || "—"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  colors: ThemeTokens;
}) {
  return (
    <View>
      <Text
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: colors.onSurfaceVariant }}
      >
        {label}
      </Text>
      <View
        className="mt-2 flex-row items-center px-4 py-4"
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 16,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={`${colors.onSurfaceVariant}99`}
          style={{
            flex: 1,
            color: colors.onSurface,
            fontSize: 16,
            fontWeight: "600",
          }}
        />
      </View>
    </View>
  );
}
