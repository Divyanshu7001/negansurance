import { useUser } from "@clerk/expo";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIGHT_PRIMARY = "#753eb5";
const LIGHT_PRIMARY_CONTAINER = "#bd87ff";
const DARK_PRIMARY = "#c799ff";

export default function HomeTab() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <View className="flex-1 bg-surface">
      {isDark ? <DarkDashboard /> : <LightDashboard />}
    </View>
  );
}

function LightDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const name = user?.firstName ?? user?.fullName ?? "there";

  const go = (title: string) =>
    router.push({ pathname: "/coming-soon", params: { title } });

  return (
    <View className="flex-1">
      <LightTopBar onMenu={() => go("Menu")} onAvatar={() => go("Profile")} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-44"
        contentContainerStyle={{ paddingTop: 96 + insets.top }}
      >
        <View className="mb-8">
          <Text className="font-headline text-4xl tracking-tight text-on-surface">
            Hi, {name}
          </Text>
          <Text className="mt-1 font-body font-medium text-on-surface-variant">
            Ready for your shift? We&apos;ve got you covered.
          </Text>
        </View>

        <View className="mb-10 overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-2xl shadow-black/5">
          <View className="mb-4 flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Live Zone Risk
              </Text>
              <Text className="mt-1 font-headline text-xl font-bold text-on-surface">
                Downtown Central
              </Text>
            </View>

            <View className="flex-row items-center gap-2 rounded-md bg-tertiary-container px-4 py-2">
              <MaterialIcons name="warning" size={16} color={"#533a00"} />
              <Text className="font-label text-[10px] font-bold uppercase text-on-tertiary-container">
                Yellow: Moderate Risk
              </Text>
            </View>
          </View>

          <View className="mb-4 h-32 overflow-hidden rounded-lg bg-surface-container-high">
            <View className="absolute inset-0 opacity-40">
              <LinearGradient
                colors={["rgba(117,62,181,0.35)", "rgba(189,135,255,0.10)"]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{ flex: 1 }}
              />
            </View>
            <View className="flex-1 items-center justify-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg">
                <MaterialIcons name="my-location" size={22} color="#faefff" />
              </View>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 rounded-lg bg-surface-container-low p-3">
              <Text className="text-[10px] font-bold uppercase text-on-surface-variant">
                Traffic Level
              </Text>
              <Text className="mt-1 font-body font-bold text-on-surface">
                Heavy (15m delay)
              </Text>
            </View>
            <View className="flex-1 rounded-lg bg-surface-container-low p-3">
              <Text className="text-[10px] font-bold uppercase text-on-surface-variant">
                Weather Risk
              </Text>
              <Text className="mt-1 font-body font-bold text-on-surface">
                Light Rain
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => go("Report Incident")}
          className="mb-10 flex-row items-center justify-between rounded-lg bg-error-container p-5"
        >
          <View className="flex-row items-center gap-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-on-error-container/10">
              <MaterialCommunityIcons name="alert" size={20} color="#510017" />
            </View>
            <View>
              <Text className="font-headline text-lg font-bold text-on-error-container">
                Report Incident
              </Text>
              <Text className="mt-0.5 text-xs font-medium text-on-error-container/80">
                Immediate claim support for accidents
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#510017" />
        </Pressable>

        <View className="mb-10">
          <View className="mb-6 flex-row items-baseline justify-between">
            <Text className="font-headline text-2xl font-extrabold text-on-surface">
              Insurance Plans
            </Text>
            <Pressable onPress={() => go("Insurance Plans")}>
              <Text className="font-label text-sm font-bold text-primary">
                View All
              </Text>
            </Pressable>
          </View>

          <View className="gap-6">
            <View className="overflow-hidden rounded-xl">
              <LinearGradient
                colors={[LIGHT_PRIMARY, LIGHT_PRIMARY_CONTAINER]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 1, borderRadius: 16 }}
              >
                <View className="rounded-[15px] bg-surface-container-lowest p-6">
                  <View className="mb-6 flex-row items-start justify-between">
                    <View>
                      <View className="self-start rounded-full bg-primary/10 px-3 py-1">
                        <Text className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Popular choice
                        </Text>
                      </View>
                      <Text className="mt-3 font-headline text-2xl font-black text-on-surface">
                        Smart Plan
                      </Text>
                      <Text className="mt-1 font-body text-sm font-medium text-on-surface-variant">
                        Dynamic Protection
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="font-headline text-3xl font-black text-primary">
                        $0.12
                      </Text>
                      <Text className="text-[10px] font-bold uppercase text-on-surface-variant">
                        per mile active
                      </Text>
                    </View>
                  </View>

                  <View className="mb-8 gap-3">
                    <FeatureRow text="Pay only while you work" />
                    <FeatureRow text="High-risk zone bonus cover" />
                    <FeatureRow text="24/7 Roadside Assistance" />
                  </View>

                  <Pressable
                    onPress={() => go("Subscribe Now")}
                    className="items-center justify-center rounded-full bg-primary py-4"
                  >
                    <Text className="font-headline text-base font-bold text-on-primary">
                      Subscribe Now
                    </Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>

            <View className="rounded-xl bg-surface-container-low p-6">
              <View className="mb-6 flex-row items-start justify-between">
                <View>
                  <Text className="font-headline text-2xl font-black text-on-surface">
                    Complete Protection
                  </Text>
                  <Text className="mt-1 font-body text-sm font-medium text-on-surface-variant">
                    Fixed Monthly Coverage
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="font-headline text-2xl font-black text-on-surface">
                    $45
                  </Text>
                  <Text className="text-[10px] font-bold uppercase text-on-surface-variant">
                    per month
                  </Text>
                </View>
              </View>

              <View className="mb-8 gap-3">
                <MutedRow text="Comprehensive liability cover" />
                <MutedRow text="Equipment & Gear replacement" />
              </View>

              <Pressable
                onPress={() => go("Select Fixed Plan")}
                className="items-center justify-center rounded-full bg-surface-container-highest py-4"
              >
                <Text className="font-headline text-base font-bold text-primary">
                  Select Fixed Plan
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 gap-4">
            <View className="rounded-lg bg-secondary-container/30 p-5">
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color="#00591d"
              />
              <Text className="mt-2 font-headline text-2xl font-black text-on-secondary-container">
                142
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-wide text-on-secondary-container/80">
                Safe Shifts
              </Text>
            </View>

            <View className="rounded-lg bg-surface-container-high p-5">
              <MaterialCommunityIcons
                name="heart-pulse"
                size={20}
                color={LIGHT_PRIMARY}
              />
              <Text className="mt-2 font-headline text-2xl font-black text-on-surface">
                98%
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                Safety Score
              </Text>
            </View>
          </View>

          <View className="flex-1 rounded-lg bg-surface-variant p-5">
            <MaterialCommunityIcons
              name="piggy-bank"
              size={20}
              color={LIGHT_PRIMARY}
            />
            <Text className="mt-2 font-headline text-2xl font-black text-primary">
              $32.50
            </Text>
            <Text className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
              Saved this month
            </Text>
            <Text className="mt-4 text-[11px] font-medium italic text-on-surface/70">
              “Switching to dynamic pricing saved me 15% vs last month.”
            </Text>
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={() => go("Quick Action")}
        style={{
          position: "absolute",
          right: 24,
          bottom: Math.max(insets.bottom, 16) + 96,
        }}
        className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-2xl"
      >
        <MaterialIcons name="add" size={28} color="#faefff" />
      </Pressable>
    </View>
  );
}

function DarkDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const name = user?.firstName ?? user?.fullName ?? "there";

  const go = (title: string) =>
    router.push({ pathname: "/coming-soon", params: { title } });

  return (
    <View className="flex-1">
      <DarkTopBar
        onSearch={() => go("Search")}
        onAvatar={() => go("Profile")}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-44"
        contentContainerStyle={{ paddingTop: 96 + insets.top }}
      >
        <View className="mb-10">
          <Text className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Welcome back
          </Text>
          <Text className="mt-1 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            Hi, {name}
          </Text>
        </View>

        <View className="mb-6 rounded-xl bg-surface-container-low p-8">
          <View className="mb-4 flex-row items-center gap-2">
            <View className="h-3 w-3 rounded-full bg-tertiary-container" />
            <Text className="text-xs font-bold uppercase tracking-wide text-tertiary">
              Moderate risk zone
            </Text>
          </View>

          <Text className="max-w-xs font-headline text-3xl font-bold leading-tight text-on-surface">
            Your protection status is currently stable.
          </Text>

          <View className="mt-6 flex-row items-center gap-4">
            <Pressable
              onPress={() => go("Optimize Security")}
              className="rounded-xl bg-primary px-6 py-3"
            >
              <Text className="font-label text-sm font-bold text-on-primary">
                Optimize Security
              </Text>
            </Pressable>
            <Pressable onPress={() => go("View map")}>
              <Text className="font-label text-sm font-semibold text-primary">
                View map
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-6 rounded-xl bg-primary-container p-8">
          <View className="mb-6 flex-row items-start justify-between">
            <MaterialIcons name="stars" size={32} color="#340064" />
            <View className="rounded-full bg-on-primary-container/10 px-3 py-1">
              <Text className="text-[10px] font-black uppercase text-on-primary-container">
                Active
              </Text>
            </View>
          </View>

          <Text className="font-headline text-2xl font-black tracking-tight text-on-primary-container">
            Smart Plan
          </Text>
          <Text className="mt-2 font-body text-sm font-medium text-on-primary-container/80">
            Full asset coverage & lifestyle support.
          </Text>

          <View className="mt-4 flex-row items-end">
            <Text className="font-headline text-3xl font-bold text-on-primary-container">
              $129
            </Text>
            <Text className="ml-1 font-label text-sm font-semibold text-on-primary-container/70">
              /mo
            </Text>
          </View>
        </View>

        <View className="gap-4">
          <CoverageTile
            label="Property"
            value="Safe"
            icon="home"
            onPress={() => go("Property")}
          />
          <CoverageTile
            label="Vehicle"
            value="Covered"
            icon="car"
            onPress={() => go("Vehicle")}
          />
          <CoverageTile
            label="Health"
            value="Premium"
            icon="medical-bag"
            onPress={() => go("Health")}
          />
        </View>

        <View className="mt-12">
          <View className="mb-8 flex-row items-end justify-between">
            <View>
              <Text className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                Recent Activity
              </Text>
              <Text className="mt-1 font-body text-sm text-on-surface-variant">
                Real-time status of your active claims.
              </Text>
            </View>

            <Pressable
              onPress={() => go("Recent Activity")}
              className="rounded-full px-4 py-2"
            >
              <Text className="font-label text-sm font-bold uppercase tracking-widest text-primary">
                See all
              </Text>
            </Pressable>
          </View>

          <View className="gap-4">
            <ActivityCard
              title="Hospital Visit Claim"
              subtitle="Processing at General Medical Center"
              amount="$420.00"
              status="In review"
              onPress={() => go("Hospital Visit Claim")}
              icon="medical-services"
            />
            <ActivityCard
              title="Legal Consultation"
              subtitle="Completed on Oct 12, 2023"
              amount="$1,200.00"
              status="Paid out"
              onPress={() => go("Legal Consultation")}
              icon="gavel"
            />
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={() => go("Quick Action")}
        style={{
          position: "absolute",
          right: 24,
          bottom: Math.max(insets.bottom, 16) + 96,
        }}
        className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-2xl"
      >
        <MaterialIcons name="add" size={28} color="#440080" />
      </Pressable>
    </View>
  );
}

function LightTopBar({
  onMenu,
  onAvatar,
}: {
  onMenu: () => void;
  onAvatar: () => void;
}) {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="absolute left-0 right-0 top-0 z-10"
    >
      <BlurView intensity={22} tint="light">
        <View className="flex-row items-center justify-between px-6 py-4 bg-surface/70">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={onMenu}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <MaterialCommunityIcons
                name="menu"
                size={22}
                color={LIGHT_PRIMARY}
              />
            </Pressable>
            <Text className="font-headline text-lg font-black tracking-tight text-primary">
              Negansurance
            </Text>
          </View>

          <Pressable
            onPress={onAvatar}
            className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-container"
          >
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View className="h-full w-full bg-surface-container-highest" />
            )}
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

function DarkTopBar({
  onSearch,
  onAvatar,
}: {
  onSearch: () => void;
  onAvatar: () => void;
}) {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="absolute left-0 right-0 top-0 z-10"
    >
      <BlurView intensity={22} tint="dark">
        <View className="flex-row items-center justify-between px-6 py-4 bg-surface/60">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons
              name="shield"
              size={22}
              color={DARK_PRIMARY}
            />
            <Text className="font-headline text-xl font-black tracking-tighter text-primary">
              Negansurance
            </Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={onSearch}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color="rgba(246,230,253,0.70)"
              />
            </Pressable>
            <Pressable
              onPress={onAvatar}
              className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/30"
            >
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
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

function FeatureRow({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <MaterialCommunityIcons name="check-circle" size={18} color="#006b25" />
      <Text className="font-body text-sm font-medium text-on-surface">
        {text}
      </Text>
    </View>
  );
}

function MutedRow({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <MaterialCommunityIcons
        name="check-decagram"
        size={18}
        color={LIGHT_PRIMARY_CONTAINER}
      />
      <Text className="font-body text-sm font-medium text-on-surface/80">
        {text}
      </Text>
    </View>
  );
}

function CoverageTile({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg bg-surface-container p-6"
    >
      <View className="flex-row items-center gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MaterialCommunityIcons name={icon} size={22} color={DARK_PRIMARY} />
        </View>
        <View>
          <Text className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {label}
          </Text>
          <Text className="mt-1 font-headline text-base font-bold text-on-surface">
            {value}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function ActivityCard({
  title,
  subtitle,
  amount,
  status,
  onPress,
  icon,
}: {
  title: string;
  subtitle: string;
  amount: string;
  status: string;
  onPress: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
}) {
  const isPaid = status.toLowerCase().includes("paid");

  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg bg-surface-container-high p-6"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface-variant">
            <MaterialIcons name={icon} size={24} color={DARK_PRIMARY} />
          </View>
          <View>
            <Text className="font-headline text-lg font-bold text-on-surface">
              {title}
            </Text>
            <Text className="mt-1 font-body text-sm text-on-surface-variant">
              {subtitle}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="font-label text-sm font-bold text-on-surface">
            {amount}
          </Text>
          <Text
            className={`mt-1 font-label text-xs font-bold uppercase tracking-tight ${
              isPaid ? "text-secondary" : "text-tertiary"
            }`}
          >
            {status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
