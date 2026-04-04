import { MaterialIcons } from "@expo/vector-icons";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    useColorScheme,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
};

type Section = {
  title: string;
  body: string[];
  bullets?: string[];
};

const SECTIONS: Section[] = [
  {
    title: "1. Agreement to Terms",
    body: [
      "By accessing or using Negansurance, you agree to be bound by these Terms and Conditions.",
      "If you do not agree with any part of these terms, you must discontinue use of the platform immediately.",
    ],
  },
  {
    title: "2. Eligibility",
    body: ["To use Negansurance, you must:"],
    bullets: [
      "Be at least 18 years of age.",
      "Hold a valid tax identification number or work permit in your operating region.",
      "Be actively engaged in a verified gig platform or independent service provision.",
    ],
  },
  {
    title: "3. Insurance Coverage",
    body: [
      "Coverage is only active during recorded work sessions initiated through the app.",
      "Your plan may include liability protection, equipment damage cover, and temporary income replacement, subject to your policy schedule and exclusions.",
    ],
  },
  {
    title: "4. Payout Conditions",
    body: [
      "Payouts are subject to verification of the incident and compliance with safety protocols.",
      "Claims should be submitted within 48 hours of the event for fastest processing.",
    ],
  },
];

export function TermsAndConditionsModal({ visible, onClose, onAccept }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const overlayPadTop = Math.max(insets.top, 12);
  const overlayPadBottom = Math.max(insets.bottom, 12);
  const sheetMaxHeight = Math.max(
    320,
    height - overlayPadTop - overlayPadBottom,
  );
  const sheetHeight = Math.min(sheetMaxHeight, Math.round(height * 0.82));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.50)",
          paddingTop: overlayPadTop,
          paddingBottom: overlayPadBottom,
        }}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close Terms and Conditions"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View
            className="overflow-hidden rounded-t-3xl"
            style={{
              height: sheetHeight,
              maxHeight: sheetMaxHeight,
              backgroundColor: isDark ? "#190f21" : "#ffffff",
            }}
          >
            {/* Sticky header */}
            <View
              className="px-6 pb-4 pt-5"
              style={{ backgroundColor: isDark ? "#130b1a" : "#fff3fe" }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className="font-headline text-xl font-extrabold tracking-tight"
                    style={{ color: isDark ? "#c799ff" : "#753eb5" }}
                  >
                    Legal Center
                  </Text>
                  <Text
                    className="mt-0.5 text-xs font-semibold"
                    style={{ color: isDark ? "#b4a6bc" : "#6c5279" }}
                  >
                    Terms and Conditions
                  </Text>
                </View>

                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: isDark ? "#261b30" : "#fdebff" }}
                >
                  <MaterialIcons
                    name="close"
                    size={20}
                    color={isDark ? "#c799ff" : "#753eb5"}
                  />
                </Pressable>
              </View>
            </View>

            {/* Scrollable content (includes hero so you can reach the top) */}
            <ScrollView
              style={{ flex: 1 }}
              className="px-6"
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <View
                className="mt-4 rounded-2xl p-5"
                style={{ backgroundColor: isDark ? "#2d2137" : "#f3d1ff" }}
              >
                <Text
                  className="font-headline text-2xl font-extrabold tracking-tight"
                  style={{ color: isDark ? "#f6e6fd" : "#3d2549" }}
                >
                  Terms and Conditions
                </Text>
                <Text
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: isDark ? "#b4a6bc" : "#6c5279" }}
                >
                  Please read these terms carefully before using Negansurance.
                </Text>
              </View>

              <View className="gap-8 pt-6">
                {SECTIONS.map((sec) => (
                  <View
                    key={sec.title}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: isDark ? "#261b30" : "#fdebff" }}
                  >
                    <Text
                      className="font-headline text-base font-bold"
                      style={{ color: isDark ? "#ba84fc" : "#753eb5" }}
                    >
                      {sec.title}
                    </Text>

                    <View className="mt-3 gap-3">
                      {sec.body.map((p) => (
                        <Text
                          key={p}
                          className="text-sm leading-relaxed"
                          style={{ color: isDark ? "#b4a6bc" : "#6c5279" }}
                        >
                          {p}
                        </Text>
                      ))}

                      {sec.bullets?.length ? (
                        <View className="mt-1 gap-2">
                          {sec.bullets.map((b) => (
                            <View
                              key={b}
                              className="flex-row items-start gap-3"
                            >
                              <View
                                className="mt-2 h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: isDark
                                    ? "#c799ff"
                                    : "#006b25",
                                }}
                              />
                              <Text
                                className="flex-1 text-sm leading-relaxed"
                                style={{
                                  color: isDark ? "#b4a6bc" : "#6c5279",
                                }}
                              >
                                {b}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}

                <Text
                  className="text-center text-[10px]"
                  style={{ color: isDark ? "#7d7185" : "#896d95" }}
                >
                  Last Updated: October 24, 2023
                </Text>
              </View>
            </ScrollView>

            {/* Sticky footer */}
            <View
              className="px-6 pb-4 pt-4"
              style={{
                borderTopWidth: 1,
                borderTopColor: isDark
                  ? "rgba(79,68,86,0.35)"
                  : "rgba(194,162,206,0.35)",
                paddingBottom: Math.max(insets.bottom, 16),
                backgroundColor: isDark ? "#190f21" : "#ffffff",
              }}
            >
              <Pressable
                onPress={onAccept}
                accessibilityRole="button"
                accessibilityLabel="Accept and Continue"
                className="w-full flex-row items-center justify-center gap-2 rounded-full py-5"
                style={{ backgroundColor: isDark ? "#c799ff" : "#753eb5" }}
              >
                <Text
                  className="font-headline text-lg font-bold"
                  style={{ color: isDark ? "#440080" : "#faefff" }}
                >
                  Accept &amp; Continue
                </Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={18}
                  color={isDark ? "#440080" : "#faefff"}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
