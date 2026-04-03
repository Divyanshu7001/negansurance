import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_CONFIG = {
  home: { label: "Home", icon: "home" as const },
  claims: { label: "Claims", icon: "file-document-outline" as const },
  profile: { label: "Profile", icon: "account-circle" as const },
};

type TabRouteName = keyof typeof TAB_CONFIG;

export default function HomeTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <HomeTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="claims" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function HomeTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const activeIconColor = isDark ? "#c799ff" : "#753eb5";
  const inactiveIconColor = isDark
    ? "rgba(246,230,253,0.60)"
    : "rgba(61,37,73,0.60)";

  const containerBgClass = isDark
    ? "bg-surface-container-low/85"
    : "bg-surface-container-lowest/90";

  const shadowClass = isDark ? "shadow-black/30" : "shadow-black/10";

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 16),
      }}
      className={`overflow-hidden rounded-t-xl ${shadowClass} shadow-2xl`}
    >
      <BlurView intensity={22} tint={isDark ? "dark" : "light"}>
        <View className={`${containerBgClass} px-4 pb-2 pt-4`}>
          <View className="flex-row items-center justify-around">
            {state.routes.map((route, index) => {
              const routeName = route.name as TabRouteName;
              const config = TAB_CONFIG[routeName];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              const activePillClass = isFocused
                ? isDark
                  ? "bg-primary-container/10"
                  : "bg-surface-container-highest"
                : "bg-transparent";

              const iconColor = isFocused ? activeIconColor : inactiveIconColor;

              const labelColorClass = isFocused
                ? "text-on-surface"
                : "text-on-surface/60";

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={
                    descriptors[route.key]?.options.tabBarAccessibilityLabel
                  }
                  testID={descriptors[route.key]?.options.tabBarButtonTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  className={`items-center justify-center rounded-[2rem] px-6 py-2 ${activePillClass}`}
                >
                  <MaterialCommunityIcons
                    name={config.icon}
                    size={22}
                    color={iconColor}
                  />
                  <Text
                    className={`mt-1 text-[11px] font-semibold uppercase tracking-wide ${labelColorClass}`}
                  >
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </BlurView>
    </View>
  );
}
