import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
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
  primaryDim: string;
  onPrimary: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
};

const LIGHT: ThemeTokens = {
  primary: "#753eb5",
  primaryDim: "#6830a8",
  onPrimary: "#faefff",
  surface: "#fff3fe",
  surfaceContainerLow: "#fdebff",
  surfaceContainerLowest: "#ffffff",
  surfaceVariant: "#f3d1ff",
  onSurface: "#3d2549",
  onSurfaceVariant: "#6c5279",
  outlineVariant: "#c2a2ce",
  secondary: "#006b25",
  secondaryContainer: "#67f67d",
  onSecondaryContainer: "#00591d",
};

const DARK: ThemeTokens = {
  primary: "#c799ff",
  primaryDim: "#ba84fc",
  onPrimary: "#440080",
  surface: "#130b1a",
  surfaceContainerLow: "#190f21",
  surfaceContainerLowest: "#000000",
  surfaceVariant: "#2d2137",
  onSurface: "#f6e6fd",
  onSurfaceVariant: "#b4a6bc",
  outlineVariant: "#4f4456",
  secondary: "#d793fa",
  secondaryContainer: "#672889",
  onSecondaryContainer: "#edc1ff",
};

export default function ReportIncidentTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? DARK : LIGHT;

  const { incidentTypes, state, setIncidentType, selectedIncident } =
    useIncidentReport();

  const canContinue = Boolean(state.incidentTypeId);

  const titleColor = colors.primary;

  const activeCardStyle = useMemo(
    () => ({
      backgroundColor: isDark ? colors.surfaceVariant : "#f3d1ff",
      borderColor: `${colors.primary}33`,
      borderWidth: 2,
    }),
    [colors.primary, colors.surfaceVariant, isDark],
  );

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
              <MaterialIcons name="arrow-back" size={22} color={titleColor} />
            </Pressable>
            <Text
              className="font-headline text-2xl font-bold tracking-tight"
              style={{ color: titleColor }}
            >
              Report Incident
            </Text>
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
          paddingBottom: 140 + Math.max(insets.bottom, 0),
        }}
        contentContainerClassName="px-6 pt-8"
      >
        <View className="mb-10">
          <Text
            className="font-headline text-3xl font-extrabold tracking-tight"
            style={{ color: colors.onSurface }}
          >
            What is disrupting your work right now?
          </Text>
          <Text
            className="mt-3 font-body text-lg"
            style={{ color: colors.onSurfaceVariant }}
          >
            Select the incident type to start your claim. This helps us
            prioritize your safety and logistics.
          </Text>
        </View>

        <View className="gap-4">
          {incidentTypes.map((item) => {
            const selected = item.id === state.incidentTypeId;
            const cardBg = selected
              ? activeCardStyle
              : {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderWidth: 0,
                  borderColor: "transparent",
                };

            const iconBoxBg = selected
              ? colors.primary
              : colors.surfaceContainerLow;
            const iconColor = selected ? colors.onPrimary : colors.primary;

            return (
              <Pressable
                key={item.id}
                onPress={() => setIncidentType(item.id)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                style={cardBg}
                className="relative overflow-hidden rounded-lg p-6"
              >
                {selected ? (
                  <View className="absolute right-4 top-4">
                    <View
                      className="h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <MaterialIcons
                        name="check"
                        size={14}
                        color={colors.onPrimary}
                      />
                    </View>
                  </View>
                ) : null}

                <View
                  className="mb-4 h-12 w-12 items-center justify-center rounded-md"
                  style={{ backgroundColor: iconBoxBg }}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={26}
                    color={iconColor}
                  />
                </View>

                <Text
                  className="font-headline text-lg font-bold"
                  style={{ color: colors.onSurface }}
                >
                  {item.title}
                </Text>
                <Text
                  className="mt-1 font-body text-sm leading-relaxed"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  {item.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          className="mt-8 flex-row items-start gap-4 rounded-md p-4"
          style={{
            backgroundColor: isDark
              ? "rgba(103,40,137,0.20)"
              : "rgba(103,246,125,0.20)",
          }}
        >
          <MaterialIcons
            name="info"
            size={18}
            color={isDark ? colors.secondary : colors.secondary}
          />
          <View className="flex-1">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.onSecondaryContainer }}
            >
              Safe Work Policy
            </Text>
            <Text
              className="mt-1 text-xs"
              style={{ color: `${colors.onSecondaryContainer}CC` }}
            >
              Your safety is our priority. If you feel unsafe, please pull over
              and contact emergency services before reporting.
            </Text>
          </View>
        </View>

        {selectedIncident ? (
          <Text
            className="mt-6 text-xs"
            style={{ color: colors.onSurfaceVariant }}
          >
            Selected: {selectedIncident.title}
          </Text>
        ) : null}
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
          onPress={() => router.push("/report-incident/details")}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          className="w-full flex-row items-center justify-center gap-2 rounded-full py-4"
          style={{
            backgroundColor: canContinue
              ? colors.primary
              : `${colors.outlineVariant}33`,
          }}
        >
          <Text
            className="font-headline text-lg font-bold"
            style={{
              color: canContinue ? colors.onPrimary : colors.onSurfaceVariant,
            }}
          >
            Continue
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={18}
            color={canContinue ? colors.onPrimary : colors.onSurfaceVariant}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
