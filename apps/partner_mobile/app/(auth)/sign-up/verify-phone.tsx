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
    },
  };
}

export default function VerifyPhonePage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const { state, setState, phoneE164, setOtpDigit, clearOtp } =
    useRegistration();

  const [now, setNow] = React.useState(() => Date.now());
  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!state.otpSent || !state.resendAvailableAt) {
      return;
    }

    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [state.otpSent, state.resendAvailableAt]);

  if (!signUp) {
    return null;
  }

  const fieldErrors = (errors as any)?.fields ?? {};

  const resendMs = state.resendAvailableAt
    ? Math.max(0, state.resendAvailableAt - now)
    : 0;

  const canResend = state.otpSent && resendMs === 0;

  const ensureSignUpInitialized = async () => {
    const params = {
      phoneNumber: phoneE164,
      emailAddress: state.emailAddress || undefined,
      firstName: state.firstName || undefined,
      lastName: state.lastName || undefined,
      unsafeMetadata: buildUnsafeMetadata(state),
    };

    if (signUp.id) {
      const { error } = await signUp.update(params);
      if (error) {
        throw error;
      }
    } else {
      const { error } = await signUp.create(params);
      if (error) {
        throw error;
      }
    }
  };

  const sendCode = async () => {
    setFormError(null);
    setBusy(true);
    try {
      await ensureSignUpInitialized();
      const { error } = await signUp.verifications.sendPhoneCode();
      if (error) {
        throw error;
      }

      clearOtp();
      setState((s) => ({
        ...s,
        otpSent: true,
        resendAvailableAt: Date.now() + 30_000,
      }));
    } catch (e: any) {
      const message =
        typeof e?.message === "string" ? e.message : "Failed to send code.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    setFormError(null);

    const code = state.otpDigits.join("");
    if (code.length !== 6) {
      setFormError("Enter the 6-digit code.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await signUp.verifications.verifyPhoneCode({ code });
      if (error) {
        throw error;
      }
      router.push("/sign-up/account-setup" as Href);
    } catch (e: any) {
      const message =
        typeof e?.message === "string" ? e.message : "Invalid code.";
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
          Mobile Verification
        </Text>
      </View>

      <View className="mb-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-label text-sm font-bold uppercase tracking-widest text-primary">
            Step 2 of 3
          </Text>
          <Text className="text-xs font-medium text-on-surface-variant">
            Verify your number
          </Text>
        </View>
        <View className="h-1.5 w-full flex-row overflow-hidden rounded-full bg-outline-variant/30">
          <View className="h-full bg-primary" style={{ width: "33.333%" }} />
          <View className="h-full bg-primary" style={{ width: "33.333%" }} />
          <View
            className="h-full bg-surface-dim"
            style={{ width: "33.333%" }}
          />
        </View>
      </View>

      <Text className="mb-2 font-headline text-3xl tracking-tight text-on-background">
        Verify your phone
      </Text>
      <Text className="mb-8 font-body text-on-surface-variant">
        We&apos;ll send a one-time code to confirm your mobile number.
      </Text>

      <View className="gap-4">
        <View className="flex-row gap-3">
          <View className="w-24 rounded-xl bg-surface-container-low px-4 py-4">
            <TextInput
              value={state.countryCode}
              onChangeText={(v) =>
                setState((s) => ({
                  ...s,
                  countryCode: v.startsWith("+") ? v : `+${v}`,
                }))
              }
              className="font-body text-on-surface"
              placeholder="+91"
              placeholderTextColor="#896d95"
              keyboardType="phone-pad"
            />
          </View>
          <View className="flex-1 rounded-xl bg-surface-container-low px-4 py-4">
            <TextInput
              value={state.phoneNationalNumber}
              onChangeText={(v) =>
                setState((s) => ({ ...s, phoneNationalNumber: v }))
              }
              className="font-body text-on-surface"
              placeholder="Phone number"
              placeholderTextColor="#896d95"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {fieldErrors?.phoneNumber?.message ? (
          <Text className="text-sm text-error">
            {fieldErrors.phoneNumber.message}
          </Text>
        ) : null}

        <Pressable
          onPress={sendCode}
          disabled={
            busy || fetchStatus === "fetching" || (state.otpSent && !canResend)
          }
          className={`w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-5 ${
            busy || fetchStatus === "fetching" || (state.otpSent && !canResend)
              ? "opacity-50"
              : ""
          }`}
        >
          <MaterialIcons name="sms" size={18} color="#faefff" />
          <Text className="font-headline text-lg text-on-primary">
            {state.otpSent
              ? canResend
                ? "Resend Code"
                : "Code Sent"
              : "Send Code"}
          </Text>
        </Pressable>

        {state.otpSent && !canResend ? (
          <Text className="text-center text-xs text-on-surface-variant">
            Resend available in {Math.ceil(resendMs / 1000)}s
          </Text>
        ) : null}
      </View>

      {state.otpSent ? (
        <View className="mt-10 gap-5">
          <Text className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Enter 6-digit code
          </Text>

          <View className="flex-row justify-between">
            {state.otpDigits.map((d, idx) => (
              <View
                key={idx}
                className="h-14 w-12 items-center justify-center rounded-xl bg-surface-container-low"
              >
                <TextInput
                  value={d}
                  onChangeText={(v) => setOtpDigit(idx, v)}
                  className="text-center font-headline text-lg text-on-surface"
                  keyboardType="number-pad"
                  maxLength={1}
                  placeholder="•"
                  placeholderTextColor="#896d95"
                />
              </View>
            ))}
          </View>

          {fieldErrors?.code?.message ? (
            <Text className="text-sm text-error">
              {fieldErrors.code.message}
            </Text>
          ) : null}

          {formError ? (
            <Text className="text-sm text-error">{formError}</Text>
          ) : null}

          <Pressable
            onPress={verifyCode}
            disabled={busy || fetchStatus === "fetching"}
            className={`w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-5 ${
              busy || fetchStatus === "fetching" ? "opacity-50" : ""
            }`}
          >
            <MaterialIcons name="verified" size={20} color="#faefff" />
            <Text className="font-headline text-lg text-on-primary">
              Verify & Continue
            </Text>
          </Pressable>
        </View>
      ) : null}

      {formError && !state.otpSent ? (
        <Text className="mt-6 text-sm text-error">{formError}</Text>
      ) : null}

      <View className="mt-10" nativeID="clerk-captcha" />
    </View>
  );
}
