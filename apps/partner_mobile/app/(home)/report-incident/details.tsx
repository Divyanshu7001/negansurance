import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  successContainer: string;
  onSuccessContainer: string;
  warningContainer: string;
  onWarningContainer: string;
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
  successContainer: "#67f67d",
  onSuccessContainer: "#00591d",
  warningContainer: "#ffcc80",
  onWarningContainer: "#533a00",
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
  successContainer: "#672889",
  onSuccessContainer: "#edc1ff",
  warningContainer: "#533a00",
  onWarningContainer: "#ffcc80",
};

function estimatePayout(incidentTypeId: string | null) {
  switch (incidentTypeId) {
    case "heavy_rain":
      return 120;
    case "flash_flood":
      return 150;
    case "traffic_jam":
      return 150;
    case "protest":
      return 100;
    case "road_closure":
      return 130;
    case "other":
    default:
      return 90;
  }
}

export default function ReportIncidentDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? DARK : LIGHT;

  const {
    recentOrders,
    state,
    selectedIncident,
    selectedOrder,
    setOrderId,
    setDescription,
    submitClaim,
  } = useIncidentReport();

  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);

  const payout = useMemo(
    () => estimatePayout(state.incidentTypeId),
    [state.incidentTypeId],
  );

  const canSubmit =
    Boolean(state.incidentTypeId) &&
    Boolean(state.orderId) &&
    state.description.trim().length > 0 &&
    state.submission.state !== "submitting";

  const submit = async () => {
    if (!state.incidentTypeId) {
      Alert.alert("Select incident type", "Please choose an incident type.");
      router.replace("/report-incident" as unknown as any);
      return;
    }

    if (!state.orderId) {
      Alert.alert(
        "Select an order",
        "Please choose a recent delivery order for this incident.",
      );
      return;
    }

    if (!state.description.trim()) {
      Alert.alert("Add details", "Please describe what happened.");
      return;
    }

    try {
      await submitClaim();
      router.push("/report-incident/result");
    } catch {
      Alert.alert(
        "Submission failed",
        "We couldn’t submit your claim right now. Please try again.",
      );
      router.push("/report-incident/result");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={[]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
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
                  Claim Details
                </Text>
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Step 2 of 3
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 140 + Math.max(insets.bottom, 0),
          }}
          contentContainerClassName="px-6 pt-8"
        >
          <View className="mb-6">
            <Text
              className="font-headline text-3xl font-extrabold tracking-tight"
              style={{ color: colors.onSurface }}
            >
              Tell us what happened
            </Text>
            <Text
              className="mt-3 font-body text-lg"
              style={{ color: colors.onSurfaceVariant }}
            >
              We’ll auto-capture your selected order and location details.
            </Text>
          </View>

          <View
            className="rounded-xl p-5"
            style={{ backgroundColor: colors.surfaceContainerLow }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${colors.primary}1A` }}
                >
                  <MaterialCommunityIcons
                    name={selectedIncident?.icon ?? "alert"}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text
                    className="font-headline text-base font-bold"
                    style={{ color: colors.onSurface }}
                  >
                    {selectedIncident?.title ?? "Incident"}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.onSurfaceVariant }}
                  >
                    Claim request overview
                  </Text>
                </View>
              </View>

              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: colors.surfaceVariant }}
              >
                <Text
                  className="text-[10px] font-bold uppercase"
                  style={{ color: colors.primary }}
                >
                  Est. ${payout}
                </Text>
              </View>
            </View>

            <View
              className="mt-4 h-px"
              style={{ backgroundColor: `${colors.outlineVariant}33` }}
            />

            <Text
              className="mt-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: colors.onSurfaceVariant }}
            >
              Recent delivery order
            </Text>

            <Pressable
              onPress={() => setOrderDropdownOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="Select recent order"
              className="mt-2 flex-row items-center justify-between rounded-lg px-4 py-4"
              style={{ backgroundColor: colors.surfaceContainerLowest }}
            >
              <View className="flex-1">
                <Text
                  className="font-headline text-base font-bold"
                  style={{ color: colors.onSurface }}
                  numberOfLines={1}
                >
                  {selectedOrder?.id ?? "Select order"} —{" "}
                  {selectedOrder?.locationName ?? ""}
                </Text>
                <Text
                  className="mt-0.5 text-xs"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  {selectedOrder?.timeLabel ?? ""}
                </Text>
              </View>
              <MaterialIcons
                name={orderDropdownOpen ? "expand-less" : "expand-more"}
                size={22}
                color={colors.primary}
              />
            </Pressable>

            {orderDropdownOpen ? (
              <View
                className="mt-2 overflow-hidden rounded-lg"
                style={{ backgroundColor: colors.surfaceContainerLowest }}
              >
                {recentOrders.map((order) => {
                  const selected = order.id === state.orderId;
                  return (
                    <Pressable
                      key={order.id}
                      onPress={() => {
                        setOrderId(order.id);
                        setOrderDropdownOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${order.id}`}
                      className="px-4 py-3"
                      style={{
                        backgroundColor: selected
                          ? isDark
                            ? "rgba(199,153,255,0.14)"
                            : "rgba(117,62,181,0.10)"
                          : "transparent",
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                          <Text
                            className="text-sm font-bold"
                            style={{ color: colors.onSurface }}
                          >
                            {order.id} — {order.locationName}
                          </Text>
                          <Text
                            className="mt-0.5 text-xs"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            {order.timeLabel}
                          </Text>
                        </View>
                        {selected ? (
                          <MaterialIcons
                            name="check"
                            size={18}
                            color={colors.primary}
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View
              className="mt-4 rounded-lg p-4"
              style={{ backgroundColor: colors.surfaceContainerLowest }}
            >
              <Text
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: colors.onSurfaceVariant }}
              >
                Auto-captured
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text
                  className="text-xs"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Location
                </Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.onSurface }}
                >
                  {selectedOrder?.locationName ?? "—"}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text
                  className="text-xs"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  GPS
                </Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.onSurface }}
                >
                  {selectedOrder?.gpsLabel ?? "—"}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text
                  className="text-xs"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Time
                </Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.onSurface }}
                >
                  {selectedOrder?.timeLabel ?? "—"}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6">
            <Text
              className="ml-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: colors.onSurfaceVariant }}
            >
              Evidence (optional)
            </Text>
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Coming soon",
                  "Photo upload will be available in a future update.",
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Add photo evidence"
              className="mt-2 flex-row items-center justify-between rounded-xl p-5"
              style={{ backgroundColor: colors.surfaceContainerLow }}
            >
              <View className="flex-row items-center gap-4">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${colors.primary}1A` }}
                >
                  <MaterialIcons
                    name="photo"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text
                    className="font-headline text-base font-bold"
                    style={{ color: colors.onSurface }}
                  >
                    Add a photo
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.onSurfaceVariant }}
                  >
                    Optional evidence for faster review
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={colors.primary}
              />
            </Pressable>
          </View>

          <View className="mt-6">
            <Text
              className="ml-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: colors.onSurfaceVariant }}
            >
              Describe the incident
            </Text>
            <View
              className="mt-2 rounded-xl px-4 py-4"
              style={{ backgroundColor: colors.surfaceContainerLowest }}
            >
              <TextInput
                value={state.description}
                onChangeText={(t) => setDescription(t)}
                placeholder="Add what happened, any delays, and current status..."
                placeholderTextColor={
                  isDark ? "rgba(180,166,188,0.55)" : "rgba(108,82,121,0.45)"
                }
                multiline
                textAlignVertical="top"
                style={{
                  minHeight: 120,
                  color: colors.onSurface,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              />
              <Text
                className="mt-2 text-[10px] font-semibold uppercase"
                style={{ color: colors.onSurfaceVariant }}
              >
                {state.description.trim().length}/240
              </Text>
            </View>
          </View>

          <View
            className="mt-6 flex-row items-start gap-4 rounded-md p-4"
            style={{
              backgroundColor: isDark
                ? "rgba(83,58,0,0.20)"
                : "rgba(255,204,128,0.28)",
            }}
          >
            <MaterialIcons
              name="lock"
              size={18}
              color={colors.onWarningContainer}
            />
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.onWarningContainer }}
              >
                Review time
              </Text>
              <Text
                className="mt-1 text-xs"
                style={{ color: `${colors.onWarningContainer}CC` }}
              >
                Claims are usually reviewed within 2–6 hours. Keep your phone
                reachable for quick verification.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={{
            paddingBottom: 24 + Math.max(insets.bottom, 0),
            backgroundColor: isDark
              ? "rgba(19,11,26,0.80)"
              : "rgba(255,243,254,0.80)",
            borderTopColor: `${colors.outlineVariant}33`,
            borderTopWidth: 1,
          }}
          className="absolute bottom-0 left-0 right-0 px-6 pt-4"
        >
          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Submit claim"
            className="w-full flex-row items-center justify-center gap-2 rounded-full py-4"
            style={{
              backgroundColor: canSubmit
                ? colors.primary
                : `${colors.outlineVariant}33`,
            }}
          >
            <Text
              className="font-headline text-lg font-bold"
              style={{
                color: canSubmit ? colors.onPrimary : colors.onSurfaceVariant,
              }}
            >
              {state.submission.state === "submitting"
                ? "Submitting..."
                : "Submit Claim"}
            </Text>
            <MaterialIcons
              name="send"
              size={18}
              color={canSubmit ? colors.onPrimary : colors.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
