import { useSignUp } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { TermsAndConditionsModal } from "@/components/TermsAndConditionsModal";
import { useRegistration } from "@/context/registration-context";
import { useServerUser } from "@/context/server-user-context";

import { registerUser, type UserRegisterRequest } from "@/lib/serverApi";

function toInt(value: string) {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function buildRegisterRequest(
  state: ReturnType<typeof useRegistration>["state"],
  phoneE164: string,
): UserRegisterRequest {
  const fullNameFromParts = `${state.firstName} ${state.lastName}`.trim();
  const fullName = (state.fullName || fullNameFromParts).trim();
  return {
    full_name: fullName,
    email: state.emailAddress.trim(),
    phone_number: phoneE164,
    operating_city: state.operatingCity.trim(),
    average_duty_hours_per_week: toInt(state.avgDailyDutyHours),
    average_weekly_earnings: toInt(state.avgWeeklyIncome),
    partner_name: state.partnerPlatform,
    partner_platform_id: state.partnerPlatformUserId.trim(),
    is_kyc_verified: true,
  };
}

export default function AccountSetupPage() {
  const signUpState = useSignUp();
  const { signUp, errors, fetchStatus } = signUpState;
  const router = useRouter();
  const { state, setState, phoneE164 } = useRegistration();
  const { setUser } = useServerUser();

  const [termsOpen, setTermsOpen] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      if (!signUp) return;
    };

    load();
  }, [signUp]);

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

  const canSubmit =
    state.password.length >= 8 &&
    state.password === state.confirmPassword &&
    state.acceptedTerms;

  const handleFinish = async () => {
    setFormError(null);

    if (!state.phoneNationalNumber.trim()) {
      setFormError("Mobile number is required.");
      return;
    }

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
      // First update legal acceptance (kept separate for older SDKs), then set password.
      await signUp.update({ legalAccepted: true });
      const { error } = await signUp.password({
        password: state.password,
      });

      if (error) {
        throw new Error("Failed to set password: " + error.message);
      }

      const anySignUp = signUp as any;
      // console.log({
      //   status: anySignUp?.status,
      //   requiredFields: anySignUp?.requiredFields,
      //   missingFields: anySignUp?.missingFields,
      //   // verifications: anySignUp?.verifications,
      // });
      //console.log("after any sign");
      //console.log(anySignUp?.status);

      if (anySignUp?.status === "abandoned") {
        throw new Error("Signup session expired. Please restart.");
      }
      //console.log("just before complete");
      
      if (anySignUp?.status === "complete") {
        // Navigate only after Clerk + server registration succeed.
        //console.log("Inside complete");
        
        const registerReq = buildRegisterRequest(state, phoneE164);
        const createdUser = await registerUser(registerReq);
        if (!createdUser || !createdUser.id) {
          setFormError("Failed to create user on server.");
          throw new Error("Failed to create user on server.");
        }
        setUser(createdUser);

        await signUp.finalize({
          // Redirect the user to the home page after signing up
          navigate: ({ session, decorateUrl }) => {
            // Handle session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            // If no session tasks, navigate the signed-in user to the home page
            const url = decorateUrl("/home");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.replace(url as Href);
            }
          },
        });
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
