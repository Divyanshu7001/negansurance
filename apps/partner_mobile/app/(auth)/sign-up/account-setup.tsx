import { useSignUp } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useRegistration } from "@/context/registration-context";

function buildUnsafeMetadata(
  state: ReturnType<typeof useRegistration>["state"],
) {
  return {
    registration: {
      fullName: state.fullName,
      operatingCity: state.operatingCity,
      partnerPlatform: state.partnerPlatform,
      partnerPlatformUserId: state.partnerPlatformUserId,
      avgDailyDutyHours: state.avgDailyDutyHours,
      avgWeeklyIncome: state.avgWeeklyIncome,
      firstName: state.firstName,
      lastName: state.lastName,
      emailAddress: state.emailAddress,
      phone: {
        countryCode: state.countryCode,
        nationalNumber: state.phoneNationalNumber,
      },
    },
  };
}

export default function AccountSetupPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const { state, setState, phoneE164 } = useRegistration();

  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  if (!signUp) {
    return null;
  }

  const fieldErrors = (errors as any)?.fields ?? {};

  const navigateToHome = (decorateUrl: (url: string) => string) => {
    const url = decorateUrl("/home");
    if (url.startsWith("http")) {
      if (typeof window !== "undefined") {
        window.location.href = url;
      }
    } else {
      router.push(url as Href);
    }
  };

  const canSubmit =
    state.password.length >= 8 &&
    state.password === state.confirmPassword &&
    state.acceptedTerms;

  const handleFinish = async () => {
    setFormError(null);

    if (state.password !== state.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (!state.acceptedTerms) {
      setFormError("Please accept the terms to continue.");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await signUp.update({
        unsafeMetadata: buildUnsafeMetadata(state),
        legalAccepted: true,
      });
      if (updateError) {
        throw updateError;
      }

      const { error: passwordError } = await signUp.password({
        password: state.password,
        phoneNumber: signUp.phoneNumber ?? phoneE164,
        emailAddress: state.emailAddress || undefined,
        firstName: state.firstName || undefined,
        lastName: state.lastName || undefined,
      });
      if (passwordError) {
        throw passwordError;
      }

      if (signUp.status === "complete") {
        const { error: finalizeError } = await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session.currentTask);
              return;
            }

            navigateToHome(decorateUrl);
          },
        });

        if (finalizeError) {
          throw finalizeError;
        }
      } else {
        setFormError(
          "Sign-up is not complete yet. Please review your details.",
        );
      }
    } catch (e: any) {
      const message =
        typeof e?.message === "string"
          ? e.message
          : "Failed to complete sign-up.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <View className="mb-8 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <MaterialIcons name="arrow-back" size={22} color="#753eb5" />
        </Pressable>
        <Text className="font-headline text-xl tracking-tight text-primary">
          Account Setup
        </Text>
      </View>

      <View className="mb-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-label text-sm font-bold uppercase tracking-widest text-primary">
            Step 3 of 3
          </Text>
          <Text className="text-xs font-medium text-on-surface-variant">
            Secure your account
          </Text>
        </View>
        <View className="h-1.5 w-full flex-row overflow-hidden rounded-full bg-outline-variant/30">
          <View className="h-full bg-primary" style={{ width: "33.333%" }} />
          <View className="h-full bg-primary" style={{ width: "33.333%" }} />
          <View className="h-full bg-primary" style={{ width: "33.333%" }} />
        </View>
      </View>

      <Text className="mb-2 font-headline text-3xl tracking-tight text-on-background">
        Set your password
      </Text>
      <Text className="mb-8 font-body text-on-surface-variant">
        Choose a strong password to protect your account.
      </Text>

      <View className="gap-4">
        <View className="rounded-xl bg-surface-container-low px-4 py-4">
          <TextInput
            value={state.password}
            onChangeText={(v) => setState((s) => ({ ...s, password: v }))}
            className="font-body text-on-surface"
            placeholder="Password (min 8 chars)"
            placeholderTextColor="#896d95"
            secureTextEntry
          />
        </View>
        {fieldErrors?.password?.message ? (
          <Text className="text-sm text-error">
            {fieldErrors.password.message}
          </Text>
        ) : null}

        <View className="rounded-xl bg-surface-container-low px-4 py-4">
          <TextInput
            value={state.confirmPassword}
            onChangeText={(v) =>
              setState((s) => ({ ...s, confirmPassword: v }))
            }
            className="font-body text-on-surface"
            placeholder="Confirm password"
            placeholderTextColor="#896d95"
            secureTextEntry
          />
        </View>

        <Pressable
          onPress={() =>
            setState((s) => ({ ...s, acceptedTerms: !s.acceptedTerms }))
          }
          className="mt-2 flex-row items-start gap-4 rounded-xl p-4"
        >
          <View
            className={`mt-1 h-6 w-6 items-center justify-center rounded-md border-2 ${
              state.acceptedTerms
                ? "border-primary bg-primary"
                : "border-outline-variant"
            }`}
          >
            {state.acceptedTerms ? (
              <MaterialIcons name="check" size={16} color="#ffffff" />
            ) : null}
          </View>
          <Text className="flex-1 font-body text-sm leading-relaxed text-on-surface-variant">
            I agree to the Terms of Service and Privacy Policy.
          </Text>
        </Pressable>

        {formError ? (
          <Text className="text-sm text-error">{formError}</Text>
        ) : null}

        <Pressable
          onPress={handleFinish}
          disabled={!canSubmit || busy || fetchStatus === "fetching"}
          className={`w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-5 ${
            !canSubmit || busy || fetchStatus === "fetching" ? "opacity-50" : ""
          }`}
        >
          <MaterialIcons name="check-circle" size={20} color="#faefff" />
          <Text className="font-headline text-lg text-on-primary">
            Create Account
          </Text>
        </Pressable>
      </View>

      <View className="mt-10" nativeID="clerk-captcha" />
    </View>
  );
}
