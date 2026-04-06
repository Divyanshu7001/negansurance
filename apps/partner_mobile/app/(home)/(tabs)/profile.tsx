import { useUser } from "@clerk/expo";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
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

import { useServerUser } from "@/context/server-user-context";

type ThemeTokens = {
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  error: string;
  errorContainer: string;
  onErrorContainer: string;
};

const LIGHT: ThemeTokens = {
  primary: "#753eb5",
  primaryContainer: "#bd87ff",
  onPrimary: "#faefff",
  secondaryContainer: "#67f67d",
  onSecondaryContainer: "#00591d",
  surface: "#fff3fe",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#fdebff",
  surfaceContainerHigh: "#f6d9ff",
  surfaceContainerHighest: "#f3d1ff",
  onSurface: "#3d2549",
  onSurfaceVariant: "#6c5279",
  outlineVariant: "#c2a2ce",
  error: "#b41340",
  errorContainer: "#f74b6d",
  onErrorContainer: "#510017",
};

const DARK: ThemeTokens = {
  primary: "#c799ff",
  primaryContainer: "#bd87ff",
  onPrimary: "#440080",
  secondaryContainer: "#672889",
  onSecondaryContainer: "#edc1ff",
  surface: "#130b1a",
  surfaceContainerLowest: "#000000",
  surfaceContainerLow: "#190f21",
  surfaceContainerHigh: "#261b30",
  surfaceContainerHighest: "#2d2137",
  onSurface: "#f6e6fd",
  onSurfaceVariant: "#b4a6bc",
  outlineVariant: "#4f4456",
  error: "#ff6e84",
  errorContainer: "#a70138",
  onErrorContainer: "#ffb2b9",
};

export default function ProfileTab() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return isDark ? <DarkProfileSettings /> : <LightProfileSettings />;
}

function LightProfileSettings() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { user: serverUser } = useServerUser();
  const insets = useSafeAreaInsets();
  const [platformId, setPlatformId] = useState("ZM-492042-KS");

  const displayName = useMemo(
    () =>
      serverUser?.full_name ??
      clerkUser?.fullName ??
      clerkUser?.firstName ??
      "Partner",
    [serverUser?.full_name, clerkUser?.firstName, clerkUser?.fullName],
  );
  const email =
    serverUser?.email ??
    clerkUser?.primaryEmailAddress?.emailAddress ??
    "karan.s@delivery.com";
  const phone =
    serverUser?.phone_number ??
    clerkUser?.primaryPhoneNumber?.phoneNumber ??
    "+91 98765 43210";
  const imageUrl = clerkUser?.imageUrl;

  const go = (
    pathname:
      | "/profile/personal-details"
      | "/profile/change-password"
      | "/profile/delete-account",
  ) => router.push(pathname);

  return (
    <SafeAreaView
      edges={[]}
      style={{ flex: 1, backgroundColor: LIGHT.surface }}
    >
      <View
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: "rgba(255,243,254,0.80)",
        }}
        className="px-6 pb-3 pt-3"
      >
        <View className="h-16 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View
              style={{ backgroundColor: LIGHT.surfaceContainerHighest }}
              className="h-8 w-8 overflow-hidden rounded-full"
            >
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text
                    className="font-headline text-xs"
                    style={{ color: LIGHT.primary }}
                  >
                    {displayName
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="font-headline font-black tracking-tighter"
              style={{ color: LIGHT.primary }}
            >
              Empathetic Guardian
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/profile/personal-details")}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(243,209,255,0.0)" }}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <MaterialIcons name="settings" size={22} color={LIGHT.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 48 + Math.max(insets.bottom, 0),
        }}
        contentContainerClassName="px-6 pt-8"
      >
        <View className="items-center">
          <View className="relative">
            <View
              className="overflow-hidden"
              style={{
                width: 128,
                height: 128,
                borderRadius: 16,
                backgroundColor: LIGHT.surfaceContainerHighest,
                borderWidth: 4,
                borderColor: LIGHT.surfaceContainerHighest,
              }}
            >
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <MaterialCommunityIcons
                    name="account"
                    size={56}
                    color={LIGHT.primary}
                  />
                </View>
              )}
            </View>

            <Pressable
              onPress={() => router.push("/profile/personal-details")}
              accessibilityRole="button"
              accessibilityLabel="Edit profile photo"
              style={{
                position: "absolute",
                right: -6,
                bottom: -6,
                backgroundColor: LIGHT.primary,
                borderRadius: 999,
                padding: 10,
              }}
              className="shadow-lg shadow-black/10"
            >
              <MaterialIcons name="edit" size={14} color={LIGHT.onPrimary} />
            </Pressable>
          </View>

          <View className="mt-4 items-center">
            <Text
              className="font-headline text-3xl font-extrabold tracking-tight"
              style={{ color: LIGHT.onSurface }}
            >
              {displayName}
            </Text>
            <View className="mt-2 flex-row items-center justify-center">
              <View
                style={{
                  backgroundColor: LIGHT.secondaryContainer,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
                className="flex-row items-center gap-1"
              >
                <MaterialIcons
                  name="verified"
                  size={14}
                  color={LIGHT.onSecondaryContainer}
                />
                <Text
                  className="font-label text-xs font-bold uppercase tracking-wider"
                  style={{ color: LIGHT.onSecondaryContainer }}
                >
                  Zomato Partner
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-10 gap-10">
          <SectionHeader
            title="Personal Details"
            rightLabel="Edit All"
            onRightPress={() => go("/profile/personal-details")}
            isLight
          />

          <View
            style={{
              backgroundColor: LIGHT.surfaceContainerLow,
              borderRadius: 16,
            }}
            className="p-6"
          >
            <LabeledChevronRow
              label="Full Name"
              value={displayName}
              onPress={() => go("/profile/personal-details")}
              isLast={false}
              isLight
            />
            <LabeledChevronRow
              label="Email Address"
              value={email}
              onPress={() => go("/profile/personal-details")}
              isLast={false}
              isLight
            />
            <LabeledChevronRow
              label="Phone Number"
              value={phone}
              onPress={() => go("/profile/personal-details")}
              isLast
              isLight
            />
          </View>

          <SectionHeader title="Work Details" isLight />

          <View
            style={{
              backgroundColor: LIGHT.surfaceContainerHighest,
              borderRadius: 16,
            }}
            className="p-6"
          >
            <Text
              className="ml-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: LIGHT.onSurfaceVariant }}
            >
              Partner Platform
            </Text>

            <View className="mt-3 flex-row gap-3">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/coming-soon",
                    params: { title: "Select partner platform" },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel="Partner platform: Zomato"
                style={{
                  backgroundColor: LIGHT.surfaceContainerLowest,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: LIGHT.primary,
                }}
                className="flex-1 flex-row items-center gap-3 px-4 py-4"
              >
                <View
                  style={{ backgroundColor: "rgba(247,75,109,0.20)" }}
                  className="h-8 w-8 items-center justify-center rounded-full"
                >
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={16}
                    color={LIGHT.error}
                  />
                </View>
                <Text
                  className="font-label text-sm font-bold"
                  style={{ color: LIGHT.onSurface }}
                >
                  Zomato
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/coming-soon",
                    params: { title: "Add platform" },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel="Add platform"
                style={{
                  backgroundColor: "rgba(255,255,255,0.50)",
                  borderRadius: 16,
                }}
                className="flex-1 flex-row items-center gap-3 px-4 py-4"
              >
                <View
                  style={{ backgroundColor: LIGHT.surfaceContainerHigh }}
                  className="h-8 w-8 items-center justify-center rounded-full"
                >
                  <MaterialIcons name="add" size={18} color={LIGHT.primary} />
                </View>
                <Text
                  className="font-label text-sm font-bold"
                  style={{ color: LIGHT.onSurface }}
                >
                  Add Platform
                </Text>
              </Pressable>
            </View>

            <View className="mt-6">
              <Text
                className="ml-1 text-xs font-bold uppercase tracking-widest"
                style={{ color: LIGHT.onSurfaceVariant }}
              >
                Partner Platform UserID
              </Text>
              <View className="relative mt-2">
                <View
                  style={{
                    backgroundColor: LIGHT.surfaceContainerLowest,
                    borderRadius: 16,
                  }}
                  className="flex-row items-center px-4 py-4"
                >
                  <TextInput
                    value={platformId}
                    onChangeText={setPlatformId}
                    placeholder="Enter ID"
                    placeholderTextColor={"rgba(61,37,73,0.35)"}
                    style={{
                      flex: 1,
                      color: LIGHT.primary,
                      fontFamily: "monospace",
                      fontWeight: "700",
                    }}
                  />
                  <MaterialCommunityIcons
                    name="fingerprint"
                    size={18}
                    color={"rgba(117,62,181,0.40)"}
                  />
                </View>
              </View>
              <Text
                className="mt-2 px-1 text-xs italic"
                style={{ color: LIGHT.onSurfaceVariant }}
              >
                Linked for automatic claim processing
              </Text>
            </View>
          </View>

          <SectionHeader title="Security" isLight />

          <View
            style={{
              backgroundColor: LIGHT.surfaceContainerLow,
              borderRadius: 16,
            }}
            className="p-6"
          >
            <Pressable
              onPress={() => go("/profile/change-password")}
              accessibilityRole="button"
              accessibilityLabel="Change password"
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-4">
                <View
                  style={{ backgroundColor: "rgba(117,62,181,0.10)" }}
                  className="h-12 w-12 items-center justify-center rounded-full"
                >
                  <MaterialIcons
                    name="lock-reset"
                    size={20}
                    color={LIGHT.primary}
                  />
                </View>
                <View>
                  <Text
                    className="font-headline text-lg font-bold"
                    style={{ color: LIGHT.onSurface }}
                  >
                    Change Password
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: LIGHT.onSurfaceVariant }}
                  >
                    Requires Mobile OTP Verification
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={LIGHT.primary}
              />
            </Pressable>
          </View>

          <View className="pb-6">
            <Text
              className="px-2 font-headline text-xl font-bold"
              style={{ color: LIGHT.error }}
            >
              Danger Zone
            </Text>

            <View
              style={{
                backgroundColor: "rgba(247,75,109,0.10)",
                borderColor: "rgba(247,75,109,0.20)",
                borderWidth: 1,
                borderRadius: 16,
              }}
              className="mt-4 p-6"
            >
              <View className="flex-row items-start gap-4">
                <View
                  style={{ backgroundColor: "rgba(247,75,109,0.20)" }}
                  className="h-12 w-12 items-center justify-center rounded-full"
                >
                  <MaterialIcons
                    name="delete-forever"
                    size={22}
                    color={LIGHT.error}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className="font-headline text-lg font-bold"
                    style={{ color: LIGHT.error }}
                  >
                    Delete Account
                  </Text>
                  <Text
                    className="mt-1 text-sm"
                    style={{ color: LIGHT.onSurfaceVariant }}
                  >
                    Deleting your account will permanently remove all policy
                    history and active coverages.
                  </Text>

                  <Pressable
                    onPress={() => go("/profile/delete-account")}
                    accessibilityRole="button"
                    accessibilityLabel="Request deletion"
                    style={{
                      marginTop: 14,
                      alignSelf: "flex-start",
                      backgroundColor: LIGHT.surfaceContainerLowest,
                      borderColor: "rgba(247,75,109,0.30)",
                      borderWidth: 1,
                      borderRadius: 999,
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                    }}
                  >
                    <Text
                      className="font-label text-sm font-bold"
                      style={{ color: LIGHT.error }}
                    >
                      Request Deletion
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DarkProfileSettings() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { user: serverUser } = useServerUser();
  const insets = useSafeAreaInsets();

  const displayName = useMemo(
    () =>
      serverUser?.full_name ??
      clerkUser?.fullName ??
      clerkUser?.firstName ??
      "Partner",
    [serverUser?.full_name, clerkUser?.firstName, clerkUser?.fullName],
  );
  const email =
    serverUser?.email ??
    clerkUser?.primaryEmailAddress?.emailAddress ??
    "karan.sharma@example.com";
  const phone =
    serverUser?.phone_number ??
    clerkUser?.primaryPhoneNumber?.phoneNumber ??
    "+91 98765 43210";
  const imageUrl = clerkUser?.imageUrl;

  const go = (
    pathname:
      | "/profile/personal-details"
      | "/profile/logout-all-devices"
      | "/profile/delete-account",
  ) => router.push(pathname);

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: DARK.surface }}>
      <View
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: "rgba(19,11,26,0.60)",
        }}
        className="px-6 pb-3 pt-3"
      >
        <View className="h-16 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons
              name="head-heart"
              size={22}
              color={DARK.primary}
            />
            <Text
              className="font-headline text-xl font-black tracking-tighter"
              style={{ color: DARK.primary }}
            >
              Negansurance
            </Text>
          </View>

          <View
            style={{ borderColor: "rgba(199,153,255,0.20)", borderWidth: 2 }}
            className="h-10 w-10 overflow-hidden rounded-full"
          >
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text
                  className="font-headline text-xs"
                  style={{ color: DARK.primary }}
                >
                  {displayName
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 48 + Math.max(insets.bottom, 0),
        }}
        contentContainerClassName="px-6 pt-8"
      >
        <View className="items-center">
          <View className="relative">
            <View
              style={{
                position: "absolute",
                left: -24,
                right: -24,
                top: -24,
                bottom: -24,
                borderRadius: 999,
                backgroundColor: "rgba(199,153,255,0.20)",
                opacity: 0.7,
              }}
            />

            <View
              style={{
                width: 128,
                height: 128,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: DARK.surfaceContainerHigh,
              }}
              className="shadow-2xl shadow-black/40"
            >
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <MaterialCommunityIcons
                    name="account"
                    size={56}
                    color={DARK.primary}
                  />
                </View>
              )}
            </View>

            <Pressable
              onPress={() => go("/profile/personal-details")}
              accessibilityRole="button"
              accessibilityLabel="Edit profile photo"
              style={{
                position: "absolute",
                right: -6,
                bottom: -6,
                backgroundColor: DARK.primary,
                borderRadius: 999,
                padding: 10,
              }}
              className="shadow-lg shadow-black/30"
            >
              <MaterialIcons name="edit" size={14} color={DARK.onPrimary} />
            </Pressable>
          </View>

          <View className="mt-4 items-center">
            <Text
              className="font-headline text-3xl font-extrabold tracking-tight"
              style={{ color: DARK.onSurface }}
            >
              {displayName}
            </Text>
            <Text
              className="mt-1 font-body font-medium"
              style={{ color: DARK.onSurfaceVariant }}
            >
              Premium Member since 2022
            </Text>
          </View>
        </View>

        <View className="mt-12 gap-12">
          <View className="gap-6">
            <View className="flex-row items-center justify-between">
              <Text
                className="font-label text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: DARK.primary }}
              >
                Personal Details
              </Text>
              <Pressable
                onPress={() => go("/profile/personal-details")}
                accessibilityRole="button"
                accessibilityLabel="Personal details"
              >
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={DARK.onSurfaceVariant}
                />
              </Pressable>
            </View>

            <View
              style={{
                backgroundColor: DARK.surfaceContainerLow,
                borderRadius: 20,
              }}
              className="p-6"
            >
              <IconDetailRow
                iconName="mail"
                label="Email Address"
                value={email}
              />
              <View className="h-6" />
              <IconDetailRow
                iconName="call"
                label="Phone Number"
                value={phone}
              />
              <View className="h-6" />
              <IconDetailRow
                iconName="location-on"
                label="Primary Address"
                value="Cyber City, Gurugram, India"
              />
            </View>
          </View>

          <View className="gap-6">
            <Text
              className="font-label text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: DARK.primary }}
            >
              Work Details
            </Text>

            <View
              style={{
                backgroundColor: DARK.surfaceContainerHigh,
                borderRadius: 24,
              }}
              className="overflow-hidden p-8"
            >
              <View
                style={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                  opacity: 0.1,
                }}
              >
                <MaterialIcons name="work" size={72} color={DARK.onSurface} />
              </View>

              <View className="flex-row items-center gap-6">
                <View
                  style={{ backgroundColor: "#ffffff", borderRadius: 18 }}
                  className="h-16 w-16 items-center justify-center overflow-hidden"
                >
                  <MaterialCommunityIcons
                    name="food"
                    size={32}
                    color={LIGHT.error}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className="font-headline text-2xl font-bold"
                    style={{ color: DARK.onSurface }}
                  >
                    Zomato
                  </Text>
                  <Text
                    className="mt-1 font-body font-medium"
                    style={{ color: DARK.primary }}
                  >
                    Senior Operations Lead
                  </Text>
                  <View className="mt-3 flex-row items-center gap-2">
                    <View
                      style={{ backgroundColor: "#006b25" }}
                      className="h-2 w-2 rounded-full"
                    />
                    <Text
                      className="font-label text-xs font-bold uppercase tracking-widest"
                      style={{ color: DARK.onSurfaceVariant }}
                    >
                      Active Coverage
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="gap-6 pb-10">
            <Text
              className="font-label text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "#d73357" }}
            >
              Danger Zone
            </Text>

            <View
              style={{
                backgroundColor: "rgba(167,1,56,0.10)",
                borderColor: "rgba(167,1,56,0.20)",
                borderWidth: 1,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <Pressable
                onPress={() => go("/profile/logout-all-devices")}
                accessibilityRole="button"
                accessibilityLabel="Log out of all devices"
                className="flex-row items-center justify-between px-6 py-6"
                style={{}}
              >
                <View className="flex-row items-center gap-4">
                  <MaterialIcons name="logout" size={22} color={DARK.error} />
                  <Text
                    className="font-headline font-bold"
                    style={{ color: DARK.error }}
                  >
                    Log Out of All Devices
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward"
                  size={18}
                  color={DARK.error}
                />
              </Pressable>

              <View
                style={{ height: 1, backgroundColor: "rgba(167,1,56,0.20)" }}
                className="mx-6"
              />

              <Pressable
                onPress={() => go("/profile/delete-account")}
                accessibilityRole="button"
                accessibilityLabel="Delete account and data"
                className="flex-row items-center justify-between px-6 py-6"
              >
                <View className="flex-row items-center gap-4">
                  <MaterialIcons
                    name="delete-forever"
                    size={22}
                    color={"#d73357"}
                  />
                  <Text
                    className="font-headline font-bold"
                    style={{ color: "#d73357" }}
                  >
                    Delete Account & Data
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward"
                  size={18}
                  color={"#d73357"}
                />
              </Pressable>
            </View>

            <Text
              className="pt-2 text-center text-[10px] font-bold uppercase tracking-widest"
              style={{ color: DARK.onSurfaceVariant }}
            >
              App Version 4.8.2 (2024)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  rightLabel,
  onRightPress,
  isLight,
}: {
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
  isLight: boolean;
}) {
  const colors = isLight ? LIGHT : DARK;

  return (
    <View className="flex-row items-center justify-between">
      <Text
        className="px-2 font-headline text-xl font-bold"
        style={{ color: colors.onSurface }}
      >
        {title}
      </Text>
      {rightLabel && onRightPress ? (
        <Pressable
          onPress={onRightPress}
          accessibilityRole="button"
          accessibilityLabel={rightLabel}
        >
          <Text
            className="font-label text-sm font-semibold"
            style={{ color: colors.primary }}
          >
            {rightLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function LabeledChevronRow({
  label,
  value,
  onPress,
  isLast,
  isLight,
}: {
  label: string;
  value: string;
  onPress: () => void;
  isLast: boolean;
  isLight: boolean;
}) {
  const colors = isLight ? LIGHT : DARK;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="py-2">
      <Text
        className="ml-1 text-xs font-bold uppercase tracking-widest"
        style={{ color: colors.onSurfaceVariant }}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center justify-between pb-2"
        style={{
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: isLast
            ? "transparent"
            : `${colors.outlineVariant}33`,
        }}
      >
        <Text
          className="font-body text-lg font-medium"
          style={{ color: colors.onSurface }}
        >
          {value}
        </Text>
        <MaterialIcons
          name="chevron-right"
          size={18}
          color={colors.outlineVariant}
        />
      </View>
    </Pressable>
  );
}

function IconDetailRow({
  iconName,
  label,
  value,
}: {
  iconName: "mail" | "call" | "location-on";
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-4">
      <View
        style={{ backgroundColor: DARK.surfaceContainerHigh }}
        className="h-12 w-12 items-center justify-center rounded-full"
      >
        <MaterialIcons name={iconName} size={20} color={DARK.primary} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: DARK.onSurfaceVariant }}
        >
          {label}
        </Text>
        <Text
          className="font-body font-semibold"
          style={{ color: DARK.onSurface }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
