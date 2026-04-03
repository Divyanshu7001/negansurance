import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ClaimsTab() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <Text className="font-headline text-3xl tracking-tight text-on-surface">
        Claims
      </Text>
      <Text className="mt-2 font-body text-on-surface-variant">
        Coming soon.
      </Text>

      <Pressable
        onPress={() =>
          router.push({ pathname: "/coming-soon", params: { title: "Claims" } })
        }
        className="mt-8 items-center justify-center rounded-full bg-primary py-4"
      >
        <Text className="font-headline text-base text-on-primary">
          View placeholder
        </Text>
      </Pressable>
    </View>
  );
}
