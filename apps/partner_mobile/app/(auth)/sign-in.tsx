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

function normalizeDigits(input: string) {
  return input.replace(/\D+/g, "");
}

function formatE164(countryCode: string, nationalNumber: string) {
  const cc = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  const nn = normalizeDigits(nationalNumber);
  return `${cc}${nn}`;
}

function maskPhone(countryCode: string, nationalNumber: string) {
  const digits = normalizeDigits(nationalNumber);
  const last4 = digits.slice(-4).padStart(4, "•");
  return `${countryCode} (***) ***-${last4}`;
}

export default function Page() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [countryCode, setCountryCode] = React.useState("+91");
  const [phoneNationalNumber, setPhoneNationalNumber] = React.useState("");

  const [otpDigits, setOtpDigits] = React.useState<string[]>(
    Array.from({ length: 6 }, () => ""),
  );
  const [otpSent, setOtpSent] = React.useState(false);
  const [resendAvailableAt, setResendAvailableAt] = React.useState<
    number | null
  >(null);
  const [now, setNow] = React.useState(() => Date.now());

  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const fieldErrors = (errors as any)?.fields ?? {};

  const identifier = React.useMemo(
    () => formatE164(countryCode, phoneNationalNumber),
    [countryCode, phoneNationalNumber],
  );

  React.useEffect(() => {
    if (!otpSent || !resendAvailableAt) {
      return;
    }

    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [otpSent, resendAvailableAt]);

  const navigateToHome = (decorateUrl?: (url: string) => unknown) => {
    if (typeof window !== "undefined") {
      const decorated = decorateUrl ? decorateUrl("/home") : "/home";
      window.location.href =
        typeof decorated === "string" ? decorated : "/home";
      return;
    }

    router.replace("/home");
  };

  const otpCode = otpDigits.join("");
  const resendMs = resendAvailableAt ? Math.max(0, resendAvailableAt - now) : 0;
  const canResend = otpSent && resendMs === 0;

  const clearOtp = () => {
    setOtpDigits(Array.from({ length: 6 }, () => ""));
  };

  const setOtpDigit = (index: number, value: string) => {
    const digit = normalizeDigits(value).slice(-1);
    setOtpDigits((current) => {
      const next = current.slice();
      next[index] = digit;
      return next;
    });
  };

  const sendOtp = async () => {
    if (!signIn) {
      return;
    }

    setFormError(null);
    setBusy(true);
    try {
      const { error: createError } = await signIn.create({ identifier });
      if (createError) {
        throw createError;
      }

      const { error: sendError } = await signIn.phoneCode.sendCode();
      if (sendError) {
        throw sendError;
      }

      clearOtp();
      setOtpSent(true);
      setResendAvailableAt(Date.now() + 45_000);
    } catch (e: any) {
      const message =
        typeof e?.message === "string" ? e.message : "Failed to send OTP.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!signIn) {
      return;
    }

    setFormError(null);
    if (otpCode.length !== 6) {
      setFormError("Enter the 6-digit code.");
      return;
    }

    setBusy(true);
    try {
      const { error: verifyError } = await signIn.phoneCode.verifyCode({
        code: otpCode,
      });
      if (verifyError) {
        throw verifyError;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize({
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
        setFormError("Verification not complete yet.");
      }
    } catch (e: any) {
      const message =
        typeof e?.message === "string" ? e.message : "Invalid code.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  };

  if (!authLoaded) {
    return null;
  }

  if (isSignedIn) {
    return null;
  }

  const disableSend =
    busy ||
    fetchStatus === "fetching" ||
    (otpSent && !canResend) ||
    normalizeDigits(phoneNationalNumber).length < 6;

  const disableVerify =
    busy || fetchStatus === "fetching" || otpCode.length !== 6;

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
                Mobile Number
              </Text>
              <View className="flex-row gap-3">
                <View className="w-20 items-center justify-center rounded-lg bg-surface-container-low px-3 py-4">
                  <TextInput
                    value={countryCode}
                    onChangeText={(v) =>
                      setCountryCode(v.startsWith("+") ? v : `+${v}`)
                    }
                    className="text-center font-label text-on-surface-variant"
                    placeholder="+91"
                    placeholderTextColor="#896d95"
                    keyboardType="phone-pad"
                  />
                </View>

                <View className="flex-1 flex-row items-center rounded-lg bg-surface-container-low px-5 py-4">
                  {!isDark ? (
                    <MaterialIcons name="phone" size={18} color="#753eb5" />
                  ) : null}
                  <TextInput
                    value={phoneNationalNumber}
                    onChangeText={setPhoneNationalNumber}
                    className="ml-3 flex-1 font-body text-lg font-semibold tracking-widest text-on-surface"
                    placeholder="000 000 0000"
                    placeholderTextColor="#896d95"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {fieldErrors?.identifier?.message ? (
                <Text className="text-sm text-error">
                  {fieldErrors.identifier.message}
                </Text>
              ) : null}
              {formError && !otpSent ? (
                <Text className="text-sm text-error">{formError}</Text>
              ) : null}
            </View>

            <Pressable
              onPress={sendOtp}
              disabled={disableSend}
              className={`w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-5 ${
                disableSend ? "opacity-50" : ""
              }`}
            >
              <Text className="font-headline text-lg text-on-primary">
                {otpSent ? (canResend ? "Resend OTP" : "OTP Sent") : "Send OTP"}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#faefff" />
            </Pressable>

            {otpSent ? (
              <View className="mt-10 border-t border-outline-variant/30 pt-10">
                <View className="items-center">
                  <Text className="font-headline text-lg font-bold text-on-surface">
                    {isDark ? "Verify Identity" : "Verify Account"}
                  </Text>
                  <Text className="mt-2 font-body text-sm text-on-surface-variant">
                    {isDark
                      ? "Enter the 6-digit code sent to your device"
                      : `Sent to ${maskPhone(countryCode, phoneNationalNumber)}`}
                  </Text>
                </View>

                <View className="mt-8 flex-row justify-between gap-2">
                  {otpDigits.map((d, idx) => (
                    <View
                      key={idx}
                      className="h-14 w-12 items-center justify-center rounded-lg bg-surface-container-lowest"
                    >
                      <TextInput
                        value={d}
                        onChangeText={(v) => setOtpDigit(idx, v)}
                        className="text-center font-headline text-xl font-extrabold text-primary"
                        keyboardType="number-pad"
                        maxLength={1}
                        placeholder="-"
                        placeholderTextColor="#896d95"
                      />
                    </View>
                  ))}
                </View>

                {formError ? (
                  <Text className="mt-4 text-sm text-error">{formError}</Text>
                ) : null}

                <View className="mt-6 items-center">
                  <Pressable
                    onPress={sendOtp}
                    disabled={!canResend || busy || fetchStatus === "fetching"}
                  >
                    <Text className="font-label text-xs font-bold uppercase tracking-widest text-primary">
                      {canResend
                        ? "Resend code"
                        : `Resend code in 00:${String(
                            Math.ceil(resendMs / 1000),
                          ).padStart(2, "0")}`}
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={verifyOtp}
                  disabled={disableVerify}
                  className={`mt-8 w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-5 ${
                    disableVerify ? "opacity-50" : ""
                  }`}
                >
                  <Text className="font-headline text-lg text-on-primary">
                    Confirm Verification
                  </Text>
                </Pressable>
              </View>
            ) : null}
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
