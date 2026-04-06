import { useAuth, useSignIn } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { useServerUser } from "@/context/server-user-context";
import { getUserByEmail } from "@/lib/serverApi";

export default function Page() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const signInState = useSignIn();
  const { signIn, errors, fetchStatus } = signInState;
  const setActive = (signInState as any).setActive as
    | ((args: { session: string }) => Promise<unknown>)
    | undefined;
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const { setUser } = useServerUser();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const fieldErrors = (errors as any)?.fields ?? {};

  const navigateToHome = (decorateUrl?: (url: string) => unknown) => {
    if (typeof window !== "undefined") {
      const decorated = decorateUrl ? decorateUrl("/home") : "/home";
      window.location.href =
        typeof decorated === "string" ? decorated : "/home";
      return;
    }

    router.replace("/home");
  };

  if (!authLoaded) {
    return null;
  }

  if (isSignedIn) {
    return null;
  }

  const disableSignIn =
    busy ||
    fetchStatus === "fetching" ||
    email.trim().length < 3 ||
    password.length < 1;

  const signInWithPassword = async () => {
    if (!signIn) return;

    setFormError(null);
    if (!email.trim()) {
      setFormError("Enter your email address.");
      return;
    }
    if (!password) {
      setFormError("Enter your password.");
      return;
    }

    setBusy(true);
    try {
      await signIn.create({ identifier: email.trim() });

      const attempt = await (signIn as any).attemptFirstFactor?.({
        strategy: "password",
        password,
      });

      const status = attempt?.status ?? (signIn as any).status;
      if (status !== "complete") {
        setFormError("Sign-in is not complete yet.");
        return;
      }

      const createdSessionId =
        attempt?.createdSessionId ?? (signIn as any).createdSessionId;

      if (typeof setActive === "function" && createdSessionId) {
        await setActive({ session: createdSessionId });
      }

      const serverUser = await getUserByEmail(email.trim());
      await setUser(serverUser);

      navigateToHome();
    } catch (e: any) {
      const message =
        typeof e?.message === "string" ? e.message : "Failed to sign in.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingBottom: 64,
          paddingTop: 48,
        }}
      >
        <View className="mb-12 items-center">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-xl bg-surface-container-high">
            <MaterialIcons
              name={isDark ? "security" : "verified-user"}
              size={30}
              color="#c799ff"
            />
          </View>
          <Text className="font-headline text-4xl tracking-tighter text-on-surface">
            Negansurance
          </Text>
          <Text className="mt-2 font-body text-on-surface-variant">
            {isDark
              ? "Your empathetic guardian in the digital age."
              : "Protecting your hustle, step by step."}
          </Text>
        </View>

        <View className="rounded-xl bg-surface-container-lowest p-8 shadow-ambient-soft">
          <View className="mb-8">
            <Text className="font-headline text-2xl font-bold text-on-surface">
              Welcome Back
            </Text>
            <Text className="mt-2 font-body text-sm text-on-surface-variant">
              {isDark
                ? "Sign in to your secure protection vault."
                : "Enter your registered mobile number to secure your session with a digital passkey."}
            </Text>
          </View>

          <View className="gap-6">
            <View className="gap-2">
              <Text className="ml-1 font-label text-xs font-bold uppercase tracking-widest text-primary">
                Email Address
              </Text>
              <View className="flex-row items-center rounded-lg bg-surface-container-low px-5 py-4">
                {!isDark ? (
                  <MaterialIcons name="email" size={18} color="#753eb5" />
                ) : null}
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  className="ml-3 flex-1 font-body text-base font-semibold text-on-surface"
                  placeholder="you@example.com"
                  placeholderTextColor="#896d95"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {fieldErrors?.identifier?.message ? (
                <Text className="text-sm text-error">
                  {fieldErrors.identifier.message}
                </Text>
              ) : null}
            </View>

            <View className="gap-2">
              <Text className="ml-1 font-label text-xs font-bold uppercase tracking-widest text-primary">
                Password
              </Text>
              <View className="flex-row items-center rounded-lg bg-surface-container-low px-5 py-4">
                {!isDark ? (
                  <MaterialIcons name="lock" size={18} color="#753eb5" />
                ) : null}
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  className="ml-3 flex-1 font-body text-base font-semibold text-on-surface"
                  placeholder="Your password"
                  placeholderTextColor="#896d95"
                  secureTextEntry
                />
              </View>

              {fieldErrors?.password?.message ? (
                <Text className="text-sm text-error">
                  {fieldErrors.password.message}
                </Text>
              ) : null}

              {formError ? (
                <Text className="text-sm text-error">{formError}</Text>
              ) : null}
            </View>

            <Pressable
              onPress={signInWithPassword}
              disabled={disableSignIn}
              className={`w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-5 ${
                disableSignIn ? "opacity-50" : ""
              }`}
            >
              <Text className="font-headline text-lg text-on-primary">
                {busy ? "Signing in…" : "Sign In"}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#faefff" />
            </Pressable>
          </View>
        </View>

        <View className="mt-10 items-center">
          <Pressable onPress={() => router.push("/sign-up")}>
            <Text className="font-label text-sm font-bold text-primary">
              Need an account? Sign up
            </Text>
          </Pressable>
        </View>

        <View className="mt-12">
          <Text className="text-center font-headline text-xl font-bold text-on-surface">
            Safe Secure Seamless
          </Text>
          <Text className="mt-2 text-center font-body text-sm text-on-surface-variant">
            Your sessions stay protected end-to-end.
          </Text>

          <View className="mt-6 gap-4">
            <View className="rounded-xl bg-surface-container-lowest p-5 shadow-ambient-soft">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
                  <MaterialIcons name="lock" size={20} color="#c799ff" />
                </View>
                <View className="flex-1">
                  <Text className="font-headline text-base font-bold text-on-surface">
                    Encrypted Session
                  </Text>
                  <Text className="mt-1 font-body text-sm text-on-surface-variant">
                    End-to-end encrypted sign-in verification.
                  </Text>
                </View>
              </View>
            </View>

            <View className="rounded-xl bg-surface-container-lowest p-5 shadow-ambient-soft">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
                  <MaterialIcons
                    name="verified-user"
                    size={20}
                    color="#c799ff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-headline text-base font-bold text-on-surface">
                    Trusted Access
                  </Text>
                  <Text className="mt-1 font-body text-sm text-on-surface-variant">
                    Secure device trust and safer login.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-10" nativeID="clerk-captcha" />
      </ScrollView>
    </View>
  );
}
