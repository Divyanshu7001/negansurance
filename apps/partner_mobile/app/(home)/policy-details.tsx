import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIGHT = {
  surface: "#F4EEF4",
  surfaceContainerLow: "#FFFFFF",
  surfaceContainerHighest: "#F5EAF7",
  primary: "#43006A",
  onPrimary: "#FFFFFF",
  onSurface: "#1E0B26",
  onSurfaceVariant: "#5F4E68",
  secondaryContainer: "#E9A9FF",
  outlineVariant: "rgba(194,162,206,0.35)",
};

const DARK = {
  surface: "#100516",
  surfaceContainerHigh: "#1E0B26",
  surfaceContainerHighest: "#2D1734",
  primary: "#F2B2FF",
  primaryContainer: "#E9A9FF",
  secondaryContainer: "#D08BFF",
  onPrimary: "#43006A",
  onSecondaryContainer: "#2A003E",
  onSurface: "#F6E6FD",
  onSurfaceVariant: "rgba(246,230,253,0.70)",
};

function asString(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  return value === "true";
}

type CoveragePreset = "smart" | "complete";

export default function PolicyDetailsScreen() {
  const scheme = useColorScheme();
  if (scheme === "dark") return <DarkPolicyDetails />;
  return <LightPolicyDetails />;
}

function LightPolicyDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const planTitle = asString(params.planTitle) ?? "Your Smart Plan";
  const heroTitle = asString(params.heroTitle) ?? "Policy Details";
  const policyId = asString(params.policyId) ?? "NE-8829-XP";
  const statusLabel = asString(params.statusLabel) ?? "Active";
  const isActive = parseBoolean(asString(params.isActive), true);

  const rateLabel = asString(params.rateLabel) ?? "Rate";
  const rateValue = asString(params.rateValue) ?? "$0.12";
  const rateUnit = asString(params.rateUnit) ?? "/mile";
  const rateChip = asString(params.rateChip) ?? "BEST VALUE";

  const coveragePreset =
    (asString(params.coveragePreset) as CoveragePreset) ?? "smart";
  const coverageTitle = asString(params.coverageTitle) ?? "Coverage";
  const coverageBadge = asString(params.coverageBadge) ?? "YOUR PROTECTION";

  const showWeekly = parseBoolean(asString(params.showWeekly), true);
  const activeMiles = asString(params.activeMiles) ?? "351.5 miles";
  const baseAccess = asString(params.baseAccess) ?? "$23.00";
  const multiplier = asString(params.multiplier) ?? "1.1x";
  const currentBill = asString(params.currentBill) ?? "$42.18";

  const coverageItems = useMemo(() => {
    const smart = [
      {
        title: "Full Coverage",
        subtitle: "Comprehensive protection",
        icon: "shield-check",
      },
      {
        title: "Accident Support",
        subtitle: "24/7 claim assistance",
        icon: "handshake",
      },
      {
        title: "Smart Alerts",
        subtitle: "Live driving insights",
        icon: "bell-badge",
      },
      {
        title: "Roadside",
        subtitle: "On-demand help",
        icon: "car-wrench",
      },
    ];

    const complete = [
      {
        title: "Full Coverage",
        subtitle: "Comprehensive protection",
        icon: "shield-check",
      },
      {
        title: "Premium Support",
        subtitle: "Priority claim handling",
        icon: "headset",
      },
      {
        title: "Rental Benefit",
        subtitle: "When you need it",
        icon: "car-key",
      },
      {
        title: "Roadside",
        subtitle: "On-demand help",
        icon: "car-wrench",
      },
    ];

    return coveragePreset === "complete" ? complete : smart;
  }, [coveragePreset]);

  const onDownload = () =>
    router.push({
      pathname: "/coming-soon",
      params: { title: "Download Policy" },
    });
  const onManage = () =>
    router.push({ pathname: "/coming-soon", params: { title: "Manage Plan" } });

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT.surface }}>
      <View className="px-6 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.60)" }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={20} color={LIGHT.primary} />
          </Pressable>
          <Text
            className="font-headline text-lg font-black"
            style={{ color: LIGHT.onSurface }}
          >
            {heroTitle}
          </Text>
          <View className="h-11 w-11" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pb-44"
      >
        <View className="mb-6">
          <Text
            className="font-headline text-3xl font-black tracking-tight"
            style={{ color: LIGHT.primary }}
          >
            {planTitle}
          </Text>

          <View className="mt-3 flex-row items-center gap-3">
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: isActive
                  ? "rgba(233,169,255,0.40)"
                  : "rgba(67,0,106,0.08)",
              }}
            >
              <Text
                className="text-[10px] font-extrabold uppercase"
                style={{
                  color: LIGHT.primary,
                  letterSpacing: 2,
                }}
              >
                {statusLabel}
              </Text>
            </View>
            <Text className="text-sm" style={{ color: LIGHT.onSurfaceVariant }}>
              Policy #{policyId}
            </Text>
          </View>
        </View>

        <View className="mb-8">
          <LinearGradient
            colors={["#43006A", "#A38CB0", "#E9A9FF"]}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            style={{ borderRadius: 18 }}
          >
            <View className="p-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className="text-xs font-bold uppercase"
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      letterSpacing: 2,
                    }}
                  >
                    {rateLabel}
                  </Text>
                  <View className="mt-2 flex-row items-end">
                    <Text
                      className="font-headline text-5xl font-black"
                      style={{ color: LIGHT.onPrimary }}
                    >
                      {rateValue}
                    </Text>
                    <Text
                      className="mb-2 text-xl font-bold"
                      style={{ color: "rgba(255,255,255,0.80)" }}
                    >
                      {rateUnit}
                    </Text>
                  </View>
                </View>

                <View className="items-end gap-3">
                  <MaterialCommunityIcons
                    name="speedometer"
                    size={24}
                    color={"rgba(255,255,255,0.85)"}
                  />
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
                  >
                    <Text
                      className="text-[11px] font-semibold"
                      style={{ color: LIGHT.onPrimary }}
                    >
                      {rateChip}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="gap-6">
          <View className="flex-row items-center justify-between">
            <Text
              className="font-headline text-xl font-bold"
              style={{ color: LIGHT.onSurface }}
            >
              {coverageTitle}
            </Text>
            <Text
              className="text-xs font-bold"
              style={{ color: LIGHT.primary, letterSpacing: 1 }}
            >
              {coverageBadge}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-4">
            {coverageItems.map((c) => (
              <View
                key={c.title}
                className="h-36 rounded-lg p-5"
                style={{
                  width: "47%",
                  backgroundColor: LIGHT.surfaceContainerLow,
                }}
              >
                <MaterialCommunityIcons
                  name={c.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={30}
                  color={LIGHT.primary}
                />
                <View className="mt-auto">
                  <Text
                    className="font-headline font-bold"
                    style={{ color: LIGHT.onSurface }}
                  >
                    {c.title}
                  </Text>
                  <Text
                    className="mt-0.5 text-xs"
                    style={{ color: LIGHT.onSurfaceVariant }}
                  >
                    {c.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {showWeekly ? (
          <View
            className="mt-6 rounded-lg p-6"
            style={{ backgroundColor: LIGHT.surfaceContainerHighest }}
          >
            <Text
              className="font-headline text-lg font-bold"
              style={{ color: LIGHT.onSurface }}
            >
              Weekly Estimation
            </Text>

            <View className="mt-4 gap-3">
              <LightRow
                label="Total active miles (Current)"
                value={activeMiles}
              />
              <LightRow label="Base network access" value={baseAccess} />
              <LightRow
                label="Protection multiplier"
                value={multiplier}
                valueColor={LIGHT.secondaryContainer}
              />

              <View
                className="mt-2 flex-row items-center justify-between pt-4"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "rgba(194,162,206,0.20)",
                }}
              >
                <Text
                  className="font-headline font-bold"
                  style={{ color: LIGHT.onSurface }}
                >
                  Current Bill
                </Text>
                <Text
                  className="font-headline text-2xl font-black"
                  style={{ color: LIGHT.primary }}
                >
                  {currentBill}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View className="mt-8 gap-4 pb-12">
          <Pressable
            onPress={onDownload}
            className="w-full flex-row items-center justify-center gap-3 rounded-full bg-primary py-5"
            accessibilityRole="button"
            accessibilityLabel="Download policy PDF"
          >
            <MaterialCommunityIcons
              name="file-pdf-box"
              size={18}
              color={LIGHT.onPrimary}
            />
            <Text
              className="font-headline text-lg font-bold"
              style={{ color: LIGHT.onPrimary }}
            >
              Download Policy (PDF)
            </Text>
          </Pressable>

          <Pressable
            onPress={onManage}
            className="w-full items-center justify-center rounded-full py-4"
            style={{ backgroundColor: LIGHT.surfaceContainerHighest }}
            accessibilityRole="button"
            accessibilityLabel="Manage plan"
          >
            <Text
              className="font-headline text-base font-bold"
              style={{ color: LIGHT.primary }}
            >
              Manage Plan
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function LightRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm" style={{ color: LIGHT.onSurfaceVariant }}>
        {label}
      </Text>
      <Text
        className="font-headline text-sm font-bold"
        style={{ color: valueColor ?? LIGHT.onSurface }}
      >
        {value}
      </Text>
    </View>
  );
}

function DarkPolicyDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const planTitle = asString(params.planTitle) ?? "Smart Plan";
  const policyId = asString(params.policyId) ?? "NE-8829-XP";
  const statusLabel = asString(params.statusLabel) ?? "Active";
  const isActive = parseBoolean(asString(params.isActive), true);

  const rateValue = asString(params.rateValue) ?? "$0.12";
  const rateUnit = asString(params.rateUnit) ?? "/mile";
  const monthTotal = asString(params.monthTotal) ?? "$42.18 Total";
  const milesDriven = asString(params.milesDriven) ?? "351.5 mi";

  const coverageTitle = asString(params.coverageTitle) ?? "Dynamic Coverage";
  const coverageBadge = asString(params.coverageBadge) ?? "REAL-TIME STATS";

  const onDownload = () =>
    router.push({
      pathname: "/coming-soon",
      params: { title: "Download Policy" },
    });
  const onBilling = () =>
    router.push({
      pathname: "/coming-soon",
      params: { title: "Billing History" },
    });

  return (
    <View style={{ flex: 1, backgroundColor: DARK.surface }}>
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
              <Text
                className="font-headline text-xl font-black tracking-tighter"
                style={{ color: DARK.primary }}
              >
                Negansurance
              </Text>
            </View>

            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/coming-soon",
                    params: { title: "Search" },
                  })
                }
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
              <View
                className="h-8 w-8 overflow-hidden rounded-full"
                style={{ borderWidth: 1, borderColor: "rgba(79,68,86,0.30)" }}
              >
                <Image
                  source={{ uri: "https://i.pravatar.cc/80" }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            </View>
          </View>
        </BlurView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-44"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 96 + insets.top }}
      >
        <View className="mb-10">
          <Pressable
            onPress={() => router.back()}
            className="mb-2 flex-row items-center gap-2"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={18} color={DARK.primary} />
            <Text
              className="text-xs font-extrabold uppercase"
              style={{ color: DARK.primary, letterSpacing: 3 }}
            >
              Policy Overview
            </Text>
          </Pressable>

          <Text
            className="font-headline text-4xl font-extrabold tracking-tight"
            style={{ color: DARK.onSurface }}
          >
            Your Protection
          </Text>

          <View className="mt-4 flex-row items-center gap-2">
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: isActive
                  ? DARK.secondaryContainer
                  : DARK.surfaceContainerHigh,
              }}
            >
              <Text
                className="text-[10px] font-extrabold uppercase"
                style={{
                  color: isActive ? DARK.onSecondaryContainer : DARK.primary,
                  letterSpacing: 2,
                }}
              >
                {statusLabel}
              </Text>
            </View>
            <Text className="text-sm" style={{ color: DARK.onSurfaceVariant }}>
              Policy #{policyId}
            </Text>
          </View>
        </View>

        <View className="mb-12 overflow-hidden rounded-xl">
          <LinearGradient
            colors={[DARK.primaryContainer, DARK.secondaryContainer]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{ padding: 28, borderRadius: 16 }}
          >
            <View className="mb-12 flex-row items-start justify-between">
              <View>
                <Text
                  className="font-headline text-2xl font-extrabold"
                  style={{ color: DARK.onPrimary }}
                >
                  {planTitle}
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: "rgba(68,0,128,0.65)" }}
                >
                  Pay-per-mile dynamic coverage
                </Text>
              </View>
              <MaterialCommunityIcons
                name="star-four-points"
                size={34}
                color={DARK.onPrimary}
              />
            </View>

            <View className="flex-row items-end gap-1">
              <Text
                className="font-headline text-5xl font-black tracking-tight"
                style={{ color: DARK.onPrimary }}
              >
                {rateValue}
              </Text>
              <Text
                className="mb-2 text-xl font-bold"
                style={{ color: "rgba(68,0,128,0.75)" }}
              >
                {rateUnit}
              </Text>
            </View>

            <View
              className="mt-8 flex-row items-center justify-between rounded-lg p-4"
              style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
            >
              <View>
                <Text
                  className="text-[10px] font-extrabold uppercase"
                  style={{ color: "rgba(68,0,128,0.55)", letterSpacing: 2 }}
                >
                  Current Month
                </Text>
                <Text
                  className="mt-1 font-headline font-bold"
                  style={{ color: DARK.onPrimary }}
                >
                  {monthTotal}
                </Text>
              </View>

              <View
                style={{
                  width: 1,
                  height: 28,
                  backgroundColor: "rgba(68,0,128,0.20)",
                }}
              />

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  className="text-[10px] font-extrabold uppercase"
                  style={{ color: "rgba(68,0,128,0.55)", letterSpacing: 2 }}
                >
                  Miles Driven
                </Text>
                <Text
                  className="mt-1 font-headline font-bold"
                  style={{ color: DARK.onPrimary }}
                >
                  {milesDriven}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="mb-12">
          <View className="mb-6 flex-row items-end justify-between">
            <Text
              className="font-headline text-xl font-bold"
              style={{ color: DARK.onSurface }}
            >
              {coverageTitle}
            </Text>
            <Text
              className="text-xs font-extrabold uppercase"
              style={{ color: DARK.primary, letterSpacing: 2 }}
            >
              {coverageBadge}
            </Text>
          </View>

          <View className="flex-row gap-4">
            <DarkCoverageCard
              title="Rain Guard"
              subtitle="Enhanced hydroplane protection active"
              icon="weather-pouring"
              tone="primary"
            />
            <DarkCoverageCard
              title="Traffic Assist"
              subtitle="Congestion risk offset applied"
              icon="traffic-light"
              tone="secondary"
            />
          </View>
        </View>

        <View className="gap-4">
          <Pressable
            onPress={onDownload}
            className="w-full flex-row items-center justify-between rounded-xl px-6 py-5"
            style={{
              backgroundColor: DARK.surfaceContainerHighest,
              borderWidth: 1,
              borderColor: "rgba(79,68,86,0.22)",
            }}
            accessibilityRole="button"
            accessibilityLabel="Download policy PDF"
          >
            <View className="flex-row items-center gap-4">
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={18}
                color={DARK.primary}
              />
              <Text
                className="font-headline font-bold"
                style={{ color: DARK.onSurface }}
              >
                Download Policy (PDF)
              </Text>
            </View>
            <MaterialCommunityIcons
              name="download"
              size={18}
              color={DARK.onSurfaceVariant}
            />
          </Pressable>

          <Pressable
            onPress={onBilling}
            className="w-full flex-row items-center justify-between rounded-xl px-6 py-5"
            style={{
              backgroundColor: DARK.surfaceContainerHighest,
              borderWidth: 1,
              borderColor: "rgba(79,68,86,0.22)",
            }}
            accessibilityRole="button"
            accessibilityLabel="Billing history"
          >
            <View className="flex-row items-center gap-4">
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={18}
                color={DARK.primary}
              />
              <Text
                className="font-headline font-bold"
                style={{ color: DARK.onSurface }}
              >
                Billing History
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={DARK.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function DarkCoverageCard({
  title,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: "primary" | "secondary";
}) {
  const iconColor = tone === "primary" ? DARK.primary : DARK.secondaryContainer;

  return (
    <View
      className="flex-1 rounded-lg p-6"
      style={{ backgroundColor: DARK.surfaceContainerHigh }}
    >
      <View
        className="mb-4 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: DARK.surfaceContainerHighest }}
      >
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
      </View>
      <Text
        className="font-headline font-bold"
        style={{ color: DARK.onSurface }}
      >
        {title}
      </Text>
      <Text className="mt-1 text-xs" style={{ color: DARK.onSurfaceVariant }}>
        {subtitle}
      </Text>
    </View>
  );
}
