import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ProfileTab() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <Text className="font-headline text-3xl tracking-tight text-on-surface">
        Profile
      </Text>
      <Text className="mt-2 font-body text-on-surface-variant">
        Signed in as{" "}
        {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "—"}
      </Text>

      <View className="mt-8 gap-3">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/coming-soon",
              params: { title: "Profile settings" },
            })
          }
          className="items-center justify-center rounded-full bg-surface-container-highest py-4"
        >
          <Text className="font-headline text-base text-primary">
            Profile settings
          </Text>
        </Pressable>

        <Pressable
          onPress={() => signOut()}
          className="items-center justify-center rounded-full bg-error-container py-4"
        >
          <Text className="font-headline text-base text-on-error-container">
            Sign out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
