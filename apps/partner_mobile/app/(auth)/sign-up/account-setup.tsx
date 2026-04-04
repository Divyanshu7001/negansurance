import { useSignUp } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { TermsAndConditionsModal } from "@/components/TermsAndConditionsModal";
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

  const [termsOpen, setTermsOpen] = React.useState(false);

  const getResultError = (result: unknown) => {
    if (!result || typeof result !== "object") return null;
    if (!("error" in result)) return null;
    return (result as any).error ?? null;
  };

  const getErrorMessage = (e: unknown, fallback: string) => {
    const anyErr = e as any;
    const fromClerk =
      anyErr?.errors?.[0]?.longMessage ??
      anyErr?.errors?.[0]?.message ??
      anyErr?.errors?.[0]?.shortMessage;
    const fromMessage =
      typeof anyErr?.message === "string" ? anyErr.message : null;
    return (fromClerk || fromMessage || fallback) as string;
  };

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
      await signUp.update({
        unsafeMetadata: buildUnsafeMetadata(state),
        legalAccepted: true,
      });
      console.log("Are we even here?");
      //console.log(updateResult);

      // const updateError = getResultError(updateResult);
      // if (updateError) throw updateError;
      console.log("before password result");

      const passwordResult = await signUp.password({
        password: state.password,
        phoneNumber: signUp.phoneNumber ?? phoneE164,
        emailAddress: state.emailAddress || undefined,
        firstName: state.firstName || undefined,
        lastName: state.lastName || undefined,
      });
      console.log(passwordResult);

      console.log("After signup password setting");

      const passwordError = getResultError(passwordResult);
      if (passwordError) throw passwordError;

      if (signUp.status === "complete") {
        const finalizeResult = await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session.currentTask);
              return;
            }

            navigateToHome(decorateUrl);
          },
        });
        console.log("Here before finalizing");

        const finalizeError = getResultError(finalizeResult);
        if (finalizeError) throw finalizeError;
      } else {
        setFormError(
          "Sign-up is not complete yet. Please review your details.",
        );
      }
    } catch (e: any) {
      console.log("Error in completing sign up: ", e);

      setFormError(getErrorMessage(e, "Failed to complete sign-up."));
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

        <View className="mt-2 flex-row items-start gap-4 rounded-xl p-4">
          <Pressable
            onPress={() =>
              setState((s) => ({ ...s, acceptedTerms: !s.acceptedTerms }))
            }
            accessibilityRole="checkbox"
            accessibilityLabel="Accept terms and conditions"
            accessibilityState={{ checked: state.acceptedTerms }}
            className={`mt-1 h-6 w-6 items-center justify-center rounded-md border-2 ${
              state.acceptedTerms
                ? "border-primary bg-primary"
                : "border-outline-variant"
            }`}
          >
            {state.acceptedTerms ? (
              <MaterialIcons name="check" size={16} color="#ffffff" />
            ) : null}
          </Pressable>

          <Text className="flex-1 font-body text-sm leading-relaxed text-on-surface-variant">
            I agree to the{" "}
            <Text
              onPress={() => setTermsOpen(true)}
              suppressHighlighting
              className={`font-body ${
                state.acceptedTerms
                  ? "font-bold text-primary underline"
                  : "text-primary underline"
              }`}
            >
              Terms &amp; Conditions
            </Text>{" "}
            and Privacy Policy.
          </Text>
        </View>

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

      <TermsAndConditionsModal
        visible={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => {
          setState((s) => ({ ...s, acceptedTerms: true }));
          setTermsOpen(false);
        }}
      />
    </View>
  );
}
