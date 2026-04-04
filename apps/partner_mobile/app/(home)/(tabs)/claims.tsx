import { useUser } from "@clerk/expo";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterKey = "all" | "active" | "completed";

type ClaimStatus = "processing" | "paid" | "rejected";

type Claim = {
  id: string;
  title: string;
  dateLabel: string;
  amountLabel: string;
  amount: string;
  status: ClaimStatus;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  claimNumber?: string;
};

type ThemeTokens = {
  primary: string;
  primaryDim: string;
  onPrimary: string;
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  errorContainer: string;
  onErrorContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
};

const LIGHT: ThemeTokens = {
  primary: "#753eb5",
  primaryDim: "#6830a8",
  onPrimary: "#faefff",
  surface: "#fff3fe",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#fdebff",
  surfaceContainerHigh: "#f6d9ff",
  surfaceContainerHighest: "#f3d1ff",
  onSurface: "#3d2549",
  onSurfaceVariant: "#6c5279",
  outlineVariant: "#c2a2ce",
  errorContainer: "#f74b6d",
  onErrorContainer: "#510017",
  secondaryContainer: "#67f67d",
  onSecondaryContainer: "#00591d",
  tertiaryContainer: "#feb700",
  onTertiaryContainer: "#533a00",
};

const DARK: ThemeTokens = {
  primary: "#c799ff",
  primaryDim: "#ba84fc",
  onPrimary: "#440080",
  surface: "#130b1a",
  surfaceContainerLowest: "#000000",
  surfaceContainerLow: "#190f21",
  surfaceContainerHigh: "#261b30",
  surfaceContainerHighest: "#2d2137",
  onSurface: "#f6e6fd",
  onSurfaceVariant: "#b4a6bc",
  outlineVariant: "#4f4456",
  errorContainer: "#a70138",
  onErrorContainer: "#ffb2b9",
  secondaryContainer: "#672889",
  onSecondaryContainer: "#edc1ff",
  tertiaryContainer: "#fd7e94",
  onTertiaryContainer: "#56001c",
};

const CLAIMS: Claim[] = [
  {
    id: "clm-92334",
    title: "Minor Collision Repair",
    dateLabel: "Nov 12, 2023",
    amountLabel: "Estimated Payout",
    amount: "$2,800.00",
    status: "processing",
    icon: "car-wrench",
    claimNumber: "#CLM-92334",
  },
  {
    id: "clm-90281",
    title: "Emergency Dental Procedure",
    dateLabel: "Oct 24, 2023",
    amountLabel: "Total Payout",
    amount: "$1,450.00",
    status: "paid",
    icon: "tooth",
    claimNumber: "#CLM-90281",
  },
  {
    id: "clm-88120",
    title: "Water Leakage Damage",
    dateLabel: "Aug 05, 2023",
    amountLabel: "Claimed Amount",
    amount: "$540.00",
    status: "rejected",
    icon: "home-flood",
    claimNumber: "#CLM-88120",
  },
  {
    id: "clm-87002",
    title: "Vet Consultation & Vaccines",
    dateLabel: "Jul 18, 2023",
    amountLabel: "Total Payout",
    amount: "$120.00",
    status: "paid",
    icon: "paw",
    claimNumber: "#CLM-87002",
  },
];

export default function ClaimsTab() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return isDark ? <DarkClaimsHistory /> : <LightClaimsHistory />;
}

function LightClaimsHistory() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return CLAIMS;
    if (filter === "active")
      return CLAIMS.filter((c) => c.status === "processing");
    return CLAIMS.filter((c) => c.status !== "processing");
  }, [filter]);

  const go = (title: string) =>
    router.push({ pathname: "/coming-soon", params: { title } });

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT.surface }}>
      <LightTopBar
        onSettings={() => go("Settings")}
        onAvatar={() => go("Profile")}
        avatarUrl={user?.imageUrl}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-44"
        contentContainerStyle={{ paddingTop: 96 + insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-10">
          <Text
            className="font-headline text-4xl font-extrabold tracking-tight"
            style={{ color: LIGHT.onSurface }}
          >
            Claims History
          </Text>
          <Text
            className="mt-2 font-body font-medium"
            style={{ color: LIGHT.onSurfaceVariant }}
          >
            Track your protection journey and payouts.
          </Text>
        </View>

        <View className="mb-8 flex-row items-center justify-between gap-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <FilterPill
              label="All Claims"
              active={filter === "all"}
              onPress={() => setFilter("all")}
              theme={LIGHT}
            />
            <FilterPill
              label="Active"
              active={filter === "active"}
              onPress={() => setFilter("active")}
              theme={LIGHT}
            />
            <FilterPill
              label="Completed"
              active={filter === "completed"}
              onPress={() => setFilter("completed")}
              theme={LIGHT}
            />
          </ScrollView>

          <Pressable
            onPress={() => go("Sort")}
            className="flex-row items-center gap-2 rounded-lg px-4 py-2"
            style={{ backgroundColor: LIGHT.surfaceContainerLow }}
            accessibilityRole="button"
            accessibilityLabel="Sort claims"
          >
            <MaterialCommunityIcons
              name="sort"
              size={18}
              color={LIGHT.primary}
            />
            <Text
              className="font-label text-sm font-extrabold"
              style={{ color: LIGHT.primary }}
            >
              Sort
            </Text>
          </Pressable>
        </View>

        <View className="gap-6">
          {filtered.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              theme={LIGHT}
              variant="light"
              onPress={() => go("Claim Details")}
            />
          ))}
        </View>

        <View className="mt-14">
          <QuickFactCard theme={LIGHT} />
        </View>
      </ScrollView>
    </View>
  );
}

function DarkClaimsHistory() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return CLAIMS;
    if (filter === "active")
      return CLAIMS.filter((c) => c.status === "processing");
    return CLAIMS.filter((c) => c.status !== "processing");
  }, [filter]);

  const go = (title: string) =>
    router.push({ pathname: "/coming-soon", params: { title } });

  return (
    <View style={{ flex: 1, backgroundColor: DARK.surface }}>
      <DarkTopBar
        onSearch={() => go("Search")}
        onAvatar={() => go("Profile")}
        avatarUrl={user?.imageUrl}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-44"
        contentContainerStyle={{ paddingTop: 96 + insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-10">
          <Text
            className="font-headline text-4xl font-extrabold tracking-tight"
            style={{ color: DARK.onSurface }}
          >
            Claims History
          </Text>
        </View>

        <View
          className="self-start rounded-full"
          style={{ backgroundColor: DARK.surfaceContainerLow, padding: 6 }}
        >
          <View className="flex-row items-center">
            <FilterPill
              label="All Claims"
              active={filter === "all"}
              onPress={() => setFilter("all")}
              theme={DARK}
              compact
            />
            <FilterPill
              label="Active"
              active={filter === "active"}
              onPress={() => setFilter("active")}
              theme={DARK}
              compact
            />
            <FilterPill
              label="Completed"
              active={filter === "completed"}
              onPress={() => setFilter("completed")}
              theme={DARK}
              compact
            />
          </View>
        </View>

        <View className="mt-8 gap-6">
          {filtered.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              theme={DARK}
              variant="dark"
              onPress={() => go("Claim Details")}
            />
          ))}
        </View>

        <View className="mt-14">
          <QuickFactCard theme={DARK} />
        </View>
      </ScrollView>
    </View>
  );
}

function LightTopBar({
  onSettings,
  onAvatar,
  avatarUrl,
}: {
  onSettings: () => void;
  onAvatar: () => void;
  avatarUrl?: string | null;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="absolute left-0 right-0 top-0 z-10"
    >
      <BlurView intensity={22} tint="light">
        <View className="flex-row items-center justify-between bg-surface/70 px-6 py-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-container">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-full w-full bg-surface-container-highest" />
              )}
            </View>
            <Text className="font-headline text-lg font-black tracking-tight text-primary">
              Empathetic Guardian
            </Text>
          </View>

          <Pressable
            onPress={onSettings}
            className="h-10 w-10 items-center justify-center rounded-full"
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <MaterialIcons name="settings" size={22} color={LIGHT.primary} />
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

function DarkTopBar({
  onSearch,
  onAvatar,
  avatarUrl,
}: {
  onSearch: () => void;
  onAvatar: () => void;
  avatarUrl?: string | null;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="absolute left-0 right-0 top-0 z-10"
    >
      <BlurView intensity={22} tint="dark">
        <View className="flex-row items-center justify-between bg-surface/60 px-6 py-4">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons
              name="shield"
              size={22}
              color={DARK.primary}
            />
            <Text className="font-headline text-xl font-black tracking-tighter text-primary">
              Negansurance
            </Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={onSearch}
              className="h-10 w-10 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Search"
            >
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color="rgba(246,230,253,0.70)"
              />
            </Pressable>
            <Pressable
              onPress={onAvatar}
              className="h-8 w-8 overflow-hidden rounded-full"
              style={{ borderWidth: 1, borderColor: "rgba(79,68,86,0.30)" }}
              accessibilityRole="button"
              accessibilityLabel="Profile"
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-full w-full bg-surface-container-highest" />
              )}
            </Pressable>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

function FilterPill({
  label,
  active,
  onPress,
  theme,
  compact,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: ThemeTokens;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="rounded-full"
      style={{
        backgroundColor: active ? theme.primary : theme.surfaceContainerHighest,
        paddingHorizontal: compact ? 18 : 24,
        paddingVertical: compact ? 10 : 12,
        marginRight: compact ? 6 : 0,
      }}
    >
      <Text
        className="font-body text-sm font-semibold"
        style={{
          color: active ? theme.onPrimary : theme.onSurfaceVariant,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ClaimCard({
  claim,
  theme,
  variant,
  onPress,
}: {
  claim: Claim;
  theme: ThemeTokens;
  variant: "light" | "dark";
  onPress: () => void;
}) {
  const badge = getStatusBadge(claim.status, theme);

  const cardBg =
    variant === "dark"
      ? theme.surfaceContainerLow
      : theme.surfaceContainerLowest;

  const iconBg =
    variant === "dark"
      ? theme.surfaceContainerHighest
      : theme.surfaceContainerHighest;

  const iconColor =
    claim.status === "rejected"
      ? variant === "dark"
        ? theme.onErrorContainer
        : theme.onSurfaceVariant
      : theme.primary;

  const showClaimNumber = variant === "dark" && claim.claimNumber;
  const amountColor =
    claim.status === "rejected" ? theme.onSurfaceVariant : theme.primary;

  const borderColor =
    variant === "dark" ? "rgba(79,68,86,0.22)" : "rgba(194,162,206,0.18)";

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-xl"
      style={{ backgroundColor: cardBg }}
      accessibilityRole="button"
      accessibilityLabel={`Claim: ${claim.title}`}
    >
      {variant === "dark" ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: badge.accent,
            opacity: 0.35,
          }}
        />
      ) : null}

      <View className="p-6">
        <View style={{ position: "absolute", top: 16, right: 16 }}>
          <View
            className="rounded-md px-4 py-1.5"
            style={{ backgroundColor: badge.bg }}
          >
            <Text
              className="text-xs font-extrabold uppercase"
              style={{ color: badge.fg, letterSpacing: 1 }}
            >
              {badge.label}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          <View
            className="h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: iconBg }}
          >
            <MaterialCommunityIcons
              name={claim.icon}
              size={26}
              color={iconColor}
            />
          </View>

          <View className="flex-1 pr-20">
            <Text
              className="font-headline text-lg font-bold"
              style={{ color: theme.onSurface }}
            >
              {claim.title}
            </Text>

            <View className="mt-1 flex-row flex-wrap items-center gap-x-4 gap-y-1">
              <View className="flex-row items-center gap-1.5">
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={14}
                  color={theme.onSurfaceVariant}
                />
                <Text
                  className="text-sm"
                  style={{ color: theme.onSurfaceVariant }}
                >
                  {claim.dateLabel}
                </Text>
              </View>
              {showClaimNumber ? (
                <View className="flex-row items-center gap-1.5">
                  <MaterialCommunityIcons
                    name="ticket-confirmation-outline"
                    size={14}
                    color={theme.onSurfaceVariant}
                  />
                  <Text
                    className="text-sm"
                    style={{ color: theme.onSurfaceVariant }}
                  >
                    {claim.claimNumber}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View
          className="mt-5 flex-row items-end justify-between pt-4"
          style={{ borderTopWidth: 1, borderTopColor: borderColor }}
        >
          <View>
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: theme.onSurfaceVariant, letterSpacing: 2 }}
            >
              {claim.amountLabel}
            </Text>
            <Text
              className="mt-1 font-headline text-2xl font-extrabold"
              style={{
                color: amountColor,
                textDecorationLine:
                  claim.status === "rejected" ? "line-through" : "none",
                opacity: claim.status === "rejected" ? 0.55 : 1,
              }}
            >
              {claim.amount}
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={22}
            color={variant === "dark" ? theme.primaryDim : theme.primary}
          />
        </View>
      </View>
    </Pressable>
  );
}

function getStatusBadge(status: ClaimStatus, theme: ThemeTokens) {
  if (status === "paid") {
    return {
      label: "Paid",
      bg: theme.secondaryContainer,
      fg: theme.onSecondaryContainer,
      accent: theme.secondaryContainer,
    };
  }
  if (status === "rejected") {
    return {
      label: "Rejected",
      bg: theme.errorContainer,
      fg: theme.onErrorContainer,
      accent: theme.errorContainer,
    };
  }
  return {
    label: "Processing",
    bg: theme.tertiaryContainer,
    fg: theme.onTertiaryContainer,
    accent: theme.tertiaryContainer,
  };
}

function QuickFactCard({ theme }: { theme: ThemeTokens }) {
  return (
    <View
      className="items-center justify-center rounded-2xl p-8"
      style={{ backgroundColor: theme.surfaceContainerHigh }}
    >
      <View
        className="mb-4 h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(199,153,255,0.10)" }}
      >
        <MaterialCommunityIcons
          name="star-four-points"
          size={34}
          color={theme.primary}
        />
      </View>
      <Text
        className="text-sm font-extrabold uppercase"
        style={{ color: theme.onSurfaceVariant, letterSpacing: 3 }}
      >
        Quick Fact
      </Text>
      <Text
        className="mt-1 font-headline text-xl font-extrabold"
        style={{ color: theme.onSurface }}
      >
        98% Claims Approved
      </Text>
      <Text className="mt-2 text-xs" style={{ color: theme.onSurfaceVariant }}>
        Based on 2023 performance
      </Text>
    </View>
  );
}
