import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";

export default function ComingSoon() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title?: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const iconColor = isDark ? "#f6e6fd" : "#3d2549";

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center gap-3 bg-surface/80 px-6 pb-4 pt-12">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <MaterialIcons name="arrow-back" size={22} color={iconColor} />
        </Pressable>
        <Text className="font-headline text-xl tracking-tight text-on-surface">
          {title ?? "Coming soon"}
        </Text>
      </View>

      <View className="flex-1 px-6 pt-10">
        <Text className="font-headline text-4xl tracking-tight text-on-surface">
          Coming soon
        </Text>
        <Text className="mt-3 font-body text-on-surface-variant">
          This section is wired for navigation, but the feature isn’t
          implemented yet.
        </Text>
      </View>
    </View>
  );
}
