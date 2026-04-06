import { useSignUp } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useRegistration } from "@/context/registration-context";

function emptyOtpDigits() {
  return Array.from({ length: 6 }, () => "");
}

export default function VerifyEmailPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const { state, setState, setOtpDigit } = useRegistration();

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

  const [now, setNow] = React.useState(() => Date.now());
  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If user switches between email/phone verification, reset OTP state.
    if (state.verificationMethod !== "email") {
      setState((s) => ({
        ...s,
        verificationMethod: "email",
        otpSent: false,
        resendAvailableAt: null,
        otpDigits: emptyOtpDigits(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    console.log(signUp.id);
    if (!signUp.id) {
      await signUp.create({
        emailAddress: state.emailAddress,
      });
    }
  };

  const sendEmailCodeCompat = async () => {
    // Prefer the newer verifications API, but fall back to classic methods.
    const anySignUp = signUp as any;
    const verifications = anySignUp?.verifications;
    //console.log("sendEmailCodeCompat: verifications: ", state.emailAddress);

    try {
      //console.log("Before sending code");
      const { error } = await verifications.sendEmailCode();
      if (error) console.log("After sending code, error: ", error);
      return;
    } catch (error) {
      console.error("Error sending email code:", error);
      throw error;
    }
  };

  const verifyEmailCodeCompat = async (code: string) => {
    const anySignUp = signUp as any;
    const verifications = anySignUp?.verifications;

    if (typeof verifications?.verifyEmailCode === "function") {
      return await verifications.verifyEmailCode({ code });
    }

    throw new Error(
      "Email verification is not supported by this Clerk SDK version.",
    );
  };

  const sendCode = async () => {
    setFormError(null);

    if (!state.emailAddress.trim()) {
      setFormError("Enter your email address.");
      return;
    }

    if (!state.phoneNationalNumber.trim()) {
      setFormError("Enter your mobile number.");
      return;
    }

    setBusy(true);
    try {
      await ensureSignUpInitialized();
      //console.log("after ensuring");

      const result = await sendEmailCodeCompat();
      //console.log("Result after sending: ",result);

      const err = getResultError(result);
      if (err) throw err;

      setState((s) => ({
        ...s,
        otpSent: true,
        resendAvailableAt: Date.now() + 30_000,
        otpDigits: emptyOtpDigits(),
      }));
    } catch (e: any) {
      setFormError(getErrorMessage(e, "Failed to send code."));
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
      const result = await verifyEmailCodeCompat(code);
      const err = getResultError(result);
      if (err) throw err;
      router.push("/sign-up/account-setup" as Href);
    } catch (e: any) {
      setFormError(getErrorMessage(e, "Invalid code."));
    } finally {
      setBusy(false);
    }
  };

  const anySignUp = signUp as any;
  const emailStatus = anySignUp?.verifications?.emailAddress?.status;
  // "verified" / "complete" depending on SDK version
  if (emailStatus === "verified" || emailStatus === "complete") {
    router.replace("/sign-up/account-setup");
    return;
  }

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <View className="mb-8 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <MaterialIcons name="arrow-back" size={22} color="#753eb5" />
          </Pressable>
          <Text className="font-headline text-xl tracking-tight text-primary">
            Email Verification
          </Text>
        </View>

        <View />
      </View>

      <View className="mb-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-label text-sm font-bold uppercase tracking-widest text-primary">
            Step 2 of 3
          </Text>
          <Text className="text-xs font-medium text-on-surface-variant">
            Verify your email
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
        Verify your email
      </Text>
      <Text className="mb-8 font-body text-on-surface-variant">
        We&apos;ll send a one-time code to confirm your email address.
        We&apos;ll also collect your mobile number for your account.
      </Text>

      <View className="gap-4">
        <View className="rounded-xl bg-surface-container-low px-4 py-4">
          <TextInput
            value={state.emailAddress}
            onChangeText={(v) => setState((s) => ({ ...s, emailAddress: v }))}
            className="font-body text-on-surface"
            placeholder="Email address"
            placeholderTextColor="#896d95"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {fieldErrors?.emailAddress?.message ? (
          <Text className="text-sm text-error">
            {fieldErrors.emailAddress.message}
          </Text>
        ) : null}

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
              placeholder="Mobile number"
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
          <MaterialIcons name="email" size={18} color="#faefff" />
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
