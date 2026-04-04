import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    Text,
    useColorScheme,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useIncidentReport } from "@/context/reportIncident-context";

type ThemeTokens = {
  primary: string;
  onPrimary: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  success: string;
  error: string;
};

const LIGHT: ThemeTokens = {
  primary: "#753eb5",
  onPrimary: "#faefff",
  surface: "#fff3fe",
  surfaceContainerLow: "#fdebff",
  surfaceContainerLowest: "#ffffff",
  surfaceVariant: "#f3d1ff",
  onSurface: "#3d2549",
  onSurfaceVariant: "#6c5279",
  outlineVariant: "#c2a2ce",
  success: "#006b25",
  error: "#9f0038",
};

const DARK: ThemeTokens = {
  primary: "#c799ff",
  onPrimary: "#440080",
  surface: "#130b1a",
  surfaceContainerLow: "#190f21",
  surfaceContainerLowest: "#000000",
  surfaceVariant: "#2d2137",
  onSurface: "#f6e6fd",
  onSurfaceVariant: "#b4a6bc",
  outlineVariant: "#4f4456",
  success: "#67f67d",
  error: "#ffb2c8",
};

export default function ReportIncidentResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? DARK : LIGHT;

  const { state, reset, resetSubmission } = useIncidentReport();

  const done = state.submission.state === "done" ? state.submission : null;
  const ok = done?.ok ?? false;

  const title = done
    ? ok
      ? "Claim request generated"
      : "We couldn’t submit your claim"
    : "Preparing your claim";

  const subtitle = done
    ? ok
      ? "We’ve created your incident claim request. You can track it in Claims."
      : (done.message ?? "Please try again in a moment.")
    : "Please wait...";

  const primaryIcon = done
    ? ok
      ? ("check-circle" as const)
      : ("close-circle" as const)
    : ("clock" as const);

  const iconColor = done
    ? ok
      ? colors.success
      : colors.error
    : colors.primary;

  const onBackDashboard = () => {
    reset();
    router.replace("/home");
  };

  const onViewClaims = () => {
    reset();
    router.replace("/claims");
  };

  const onRetry = () => {
    resetSubmission();
    router.replace("/report-incident/details");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={[]}
    >
      <View
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: isDark
            ? "rgba(45,27,54,0.60)"
            : "rgba(253,235,255,0.60)",
        }}
        className="px-6 pb-3 pt-3"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <MaterialIcons
                name="arrow-back"
                size={22}
                color={colors.primary}
              />
            </Pressable>
            <View>
              <Text
                className="font-headline text-2xl font-bold tracking-tight"
                style={{ color: colors.primary }}
              >
                Result
              </Text>
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.onSurfaceVariant }}
              >
                Step 3 of 3
              </Text>
            </View>
          </View>

          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceVariant }}
          >
            <MaterialIcons
              name="help-outline"
              size={20}
              color={colors.primary}
            />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 28 + Math.max(insets.bottom, 0),
        }}
        contentContainerClassName="px-6 pt-10"
      >
        <View className="items-center">
          <MaterialCommunityIcons
            name={primaryIcon}
            size={86}
            color={iconColor}
          />

          <Text
            className="mt-6 text-center font-headline text-3xl font-extrabold"
            style={{ color: colors.onSurface }}
          >
            {title}
          </Text>
          <Text
            className="mt-3 text-center font-body text-base"
            style={{ color: colors.onSurfaceVariant }}
          >
            {subtitle}
          </Text>
        </View>

        <View
          className="mt-10 rounded-2xl p-6"
          style={{ backgroundColor: colors.surfaceContainerLow }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: colors.onSurfaceVariant }}
            >
              Claim summary
            </Text>
            {done ? (
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor: ok
                    ? isDark
                      ? "rgba(103,246,125,0.14)"
                      : "rgba(0,107,37,0.10)"
                    : isDark
                      ? "rgba(255,178,200,0.12)"
                      : "rgba(159,0,56,0.10)",
                }}
              >
                <Text
                  className="text-[10px] font-bold uppercase"
                  style={{ color: ok ? colors.success : colors.error }}
                >
                  {ok ? "Submitted" : "Failed"}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            className="mt-4 h-px"
            style={{ backgroundColor: `${colors.outlineVariant}33` }}
          />

          <View className="mt-4">
            <Row
              label="Claim ID"
              value={done?.claimId ?? "—"}
              colors={colors}
            />
            <Row
              label="Incident"
              value={done?.incidentTitle ?? "—"}
              colors={colors}
            />
            <Row
              label="Estimated payout"
              value={done ? `$${done.estimatedPayout}` : "—"}
              colors={colors}
            />
          </View>

          <Text
            className="mt-4 text-xs"
            style={{ color: colors.onSurfaceVariant }}
          >
            {ok
              ? "We’ll notify you once the claim is reviewed."
              : "Nothing was charged or deducted. You can retry safely."}
          </Text>
        </View>

        <View className="mt-8 gap-4">
          {done ? (
            ok ? (
              <>
                <Pressable
                  onPress={onBackDashboard}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Dashboard"
                  className="items-center justify-center rounded-full py-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text
                    className="font-headline text-base font-bold"
                    style={{ color: colors.onPrimary }}
                  >
                    Back to Dashboard
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onViewClaims}
                  accessibilityRole="button"
                  accessibilityLabel="View Active Claims"
                  className="items-center justify-center rounded-full py-4"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Text
                    className="font-headline text-base font-bold"
                    style={{ color: colors.primary }}
                  >
                    View Active Claims
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={onRetry}
                  accessibilityRole="button"
                  accessibilityLabel="Try again"
                  className="items-center justify-center rounded-full py-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text
                    className="font-headline text-base font-bold"
                    style={{ color: colors.onPrimary }}
                  >
                    Try Again
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onBackDashboard}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Dashboard"
                  className="items-center justify-center rounded-full py-4"
                  style={{ backgroundColor: colors.surfaceVariant }}
                >
                  <Text
                    className="font-headline text-base font-bold"
                    style={{ color: colors.primary }}
                  >
                    Back to Dashboard
                  </Text>
                </Pressable>
              </>
            )
          ) : (
            <>
              <Pressable
                onPress={() => router.replace("/report-incident/details")}
                accessibilityRole="button"
                accessibilityLabel="Back to details"
                className="items-center justify-center rounded-full py-4"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  className="font-headline text-base font-bold"
                  style={{ color: colors.onPrimary }}
                >
                  Back to Details
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <Text
          className="mt-8 text-center text-[10px]"
          style={{ color: colors.onSurfaceVariant }}
        >
          For urgent safety issues, contact emergency services immediately.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { onSurfaceVariant: string; onSurface: string };
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text className="text-xs font-bold" style={{ color: colors.onSurface }}>
        {value}
      </Text>
    </View>
  );
}
