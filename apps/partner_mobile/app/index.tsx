import { useAuth } from "@clerk/expo";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, Link, Redirect } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";

const LIGHT_BG_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAWQJLmVlBJw5h0Y9rWFz-PUTJXiuZcHmDoK_NGpSpvmEnGv9tyWjeOQJT641IxOM87W4XcmA0jNYh2my6hXwSGmZJuiCLJtloDkZMYzATQ554bUEg9Sm49Nt6TBw643mAOYo-GQ_2LT5Pwhl8V_JqXc1AJ-yqQiptKgKuKz0OktSEQuH15ghsOE2tzxR9a2BFBQYJUXA-tas2o9SMQPo7lptTjWgL_8W5f2wZWsEiWl3fuZWvGd9i_U3TbiJIJoQjd3MxNcOnImAmt";

const DARK_BG_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDS1NqTtV1slsTEe1jx7RLf2CSgwwXclifOer2_H15j8bD6ncdfPoDb3Z9T36rqE6LaAEd46AixQLDgZMNRc7XZKWbFeBmPIiHkQwmcLjAqmYzZwdJ57y0xHRXBaRGYGbyN7DIxji84__m-1aTs3JAyx3dNQJRkLaP-b247uj65ALzj8wMaO-L6S486NhCL8hcnRvn0p09Gybn3-ma3gCgpEBEFp45JcA12V-xo1VYA96M6p2tU-zOG9BGJKxZJjtlv6bv7EqMZIqRX";

const AVATAR_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlDvZA-iC_rMPFHsGahKPr68U2y795JSNM8ffbGajDGrW9rWpxd-Ufc-gpuU3dRBzjNbChhp0cmmEXFBiGeXsxVAbh8VsOeBbn5cbbSgarf0SIFZx6T-zucO51q_6zbqmvE-kPXfLaMFHexrH-4yQvXsJdWzWLoFMFtIoALUQ6CZ7Q2AY75J8gshTIGgxkl68M-6I30-E-A5jCNmRhW0EUXMlmhqzCA0xwZ8sCSLTfmh_3NjLg7f_16lGdvf9boTUNIHwP2XDLyMYn";
const AVATAR_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBreXSIZIELymil-34SUXCYFiN5t517iKRKl2s9tW80ugXpGNRandcRBv1LOTra2gOwMtjiMZu2-w6MOmftVXkbWAAOXFWUtwnnP7RP5NKfvSG6x9vVzloWNJ3dVFz2lizfeDb4p0HNfRy_PWZ3KqGCSuf-laU9yWvAHCU9dNBAepII9PS19H96-yXDueDf0-bcXbRWasxqrEncDZBQ0kDCxOf-eXXN9qEbUIh9794K_t3wKz0Neg9F6rqrW3ITIZK0ylUHgrpcrlnM";
const AVATAR_3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAA5ltFcjIxbQ6-Q5cIIf2CjJXlgrLf1wRgRznWdzgxeezHlO7AMV-Pk-9biTZVbbfyaag447vHcSN3RHtEKzECcoG5YZqzarsJw03zYRjimq5NprZwy6diqRj8Y3QeSBhIBFSdMNVeyraZwKPpL5kxKIyyrWXCfPz0HmTcyX1CHYgNWmO_SS3NUnPnmeHXlQYQRBgni9BPGYsvb2QwUUtXR1iMHvAI23ZRwCdfNHMXp6nlY0Cyo8HhG3nOu9nFaGMhMPn2GwN7veM9";

export default function IndexPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={"/home" as Href} />;
  }

  return (
    <View className="flex-1 bg-surface" >
      {isDark ? <DarkWelcome /> : <LightWelcome />}
    </View>
  );
}

function LightWelcome() {
  return (
    <ImageBackground
      source={{ uri: LIGHT_BG_URI }}
      resizeMode="cover"
      className="flex-1"
    >
      <LinearGradient
        colors={["rgba(26,4,38,0.40)", "rgba(26,4,38,0.95)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <View className="flex-1 justify-end px-8 pb-16 pt-12">
        <View className="mb-12 items-center">
          <BlurView
            intensity={20}
            tint="dark"
            className="overflow-hidden rounded-xl"
          >
            <View className="rounded-xl bg-surface-container-highest/20 px-5 py-4">
              <Text className="font-headline text-3xl tracking-tighter text-surface-container-lowest">
                Negansurance
              </Text>
            </View>
          </BlurView>
        </View>

        <View className="mb-12 gap-6">
          <Text className="font-headline text-5xl leading-[1.1] tracking-tight text-surface-container-lowest">
            Welcome to{"\n"}Negansurance
          </Text>
          <Text className="max-w-sm font-body text-lg font-medium leading-relaxed text-surface-container-low opacity-90">
            Saving and compensating for your loss while you deliver
          </Text>
        </View>

        <View className="gap-4">
          <Link href={"/sign-up" as Href} asChild>
            <Pressable>
              <LinearGradient
                colors={["#753eb5", "#bd87ff"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                  borderRadius: 9999,
                  paddingVertical: 18,
                  paddingHorizontal: 40,
                }}
              >
                <View className="flex-row items-center justify-center gap-3">
                  <Text className="font-label text-lg text-on-primary">
                    Create Account
                  </Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={22}
                    color="#faefff"
                  />
                </View>
              </LinearGradient>
            </Pressable>
          </Link>

          <Link href={"/sign-in" as Href} asChild>
            <Pressable>
              <BlurView
                intensity={18}
                tint="dark"
                className="overflow-hidden rounded-full"
              >
                <View className="rounded-full border border-surface-container-lowest/30 bg-surface-container-lowest/10 px-10 py-[18px]">
                  <Text className="text-center font-label text-lg text-surface-container-lowest">
                    Login
                  </Text>
                </View>
              </BlurView>
            </Pressable>
          </Link>
        </View>

        <View className="mt-12 flex-row items-center justify-center gap-4 opacity-70">
          <View className="flex-row">
            <Avatar uri={AVATAR_1} />
            <Avatar uri={AVATAR_2} overlap />
            <Avatar uri={AVATAR_3} overlap />
          </View>
          <Text className="font-label text-sm uppercase tracking-wide text-surface-container-low">
            Joined by 50k+ Delivery Partners
          </Text>
        </View>
      </View>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <View className="h-2 items-center justify-start rounded-t-xl bg-surface-container-lowest p-1">
          <View className="mt-2 h-1.5 w-12 rounded-full bg-outline-variant/30" />
        </View>
      </View>
    </ImageBackground>
  );
}

function DarkWelcome() {
  return (
    <ImageBackground
      source={{ uri: DARK_BG_URI }}
      resizeMode="cover"
      className="flex-1"
    >
      <LinearGradient
        colors={["rgba(19,11,26,0.00)", "rgba(19,11,26,1.00)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={["rgba(19,11,26,0.40)", "rgba(19,11,26,0.00)"]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 0.4 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="absolute inset-0 bg-surface/20" />

      <View className="absolute left-0 right-0 top-0">
        <BlurView intensity={25} tint="dark" className="overflow-hidden">
          <View className="h-16 flex-row items-center justify-between px-6">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="shield" size={22} color="#c799ff" />
              <Text className="font-headline text-xl tracking-tighter text-primary">
                Negansurance
              </Text>
            </View>

            <View className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant/30">
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0y5rNvVLKx_uv5ULBwUscBvXcPdctlBw8NHEvuW6KAgmbl0oEWdKTqI3j8bmSALnabq-LccWklLLVlGPwKwJ6I6frFt2B9BXJYGDb-LcJNS0jpsfUQ4Wo2bBr5VBkX3qPzIwOjKvDjLPgr7z0gifDrSuoOjIaV_GEve7RNRgQ0INGVhaWONByK0ZTE2XGjVCoNgUdSNQHL6rP_67h0TWlri-i06qkZmxANKn_hdqv3vPhkxKXKTdXFT7_hTXxFLMleFVXgwaSNfZC",
                }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
          </View>
        </BlurView>
      </View>

      <View className="flex-1 justify-end px-8 pb-32">
        <View className="gap-6">
          <View className="self-start rounded-full border border-secondary-container/20 bg-secondary-container/30 px-4 py-2">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-primary-fixed" />
              <Text className="font-label text-xs uppercase tracking-widest text-secondary-fixed">
                Now Active for Gig Workers
              </Text>
            </View>
          </View>

          <Text className="font-headline text-5xl leading-[1.1] tracking-tighter text-on-surface">
            Protecting{"\n"}
            <Text className="text-primary">Your Hustle.</Text>
          </Text>

          <Text className="max-w-md font-body text-lg leading-relaxed text-on-surface-variant">
            Saving and compensating for your loss while you deliver. The
            luminescent sanctuary for modern workers.
          </Text>
        </View>

        <View className="mt-10 gap-4">
          <Link href={"/sign-up" as Href} asChild>
            <Pressable className="active:scale-95">
              <View className="rounded-xl bg-primary px-8 py-5">
                <View className="flex-row items-center justify-center gap-3">
                  <Text className="font-label text-lg text-on-primary">
                    Create Account
                  </Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={22}
                    color="#440080"
                  />
                </View>
              </View>
            </Pressable>
          </Link>

          <Link href={"/sign-in" as Href} asChild>
            <Pressable className="active:scale-95">
              <BlurView
                intensity={18}
                tint="dark"
                className="overflow-hidden rounded-xl"
              >
                <View className="rounded-xl border border-outline-variant/20 bg-surface-container-high/50 px-8 py-5">
                  <Text className="text-center font-label text-lg text-on-surface">
                    Login
                  </Text>
                </View>
              </BlurView>
            </Pressable>
          </Link>
        </View>

        <View className="mt-12 flex-row items-center gap-6">
          <View className="flex-row">
            <Avatar
              uri={AVATAR_1}
              size={40}
              borderColorClassName="border-surface"
            />
            <Avatar
              uri={AVATAR_2}
              size={40}
              overlap
              borderColorClassName="border-surface"
            />
            <Avatar
              uri={AVATAR_3}
              size={40}
              overlap
              borderColorClassName="border-surface"
            />
          </View>
          <View>
            <Text className="font-label text-sm text-on-surface">
              12k+ Couriers
            </Text>
            <Text className="text-xs text-on-surface-variant">
              Insured across your city
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

function Avatar({
  uri,
  overlap,
  size = 32,
  borderColorClassName = "border-primary",
}: {
  uri: string;
  overlap?: boolean;
  size?: number;
  borderColorClassName?: string;
}) {
  return (
    <View
      className={`${overlap ? "-ml-3" : ""} overflow-hidden rounded-full border-2 ${borderColorClassName}`}
      style={{ width: size, height: size }}
    >
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />
    </View>
  );
}
