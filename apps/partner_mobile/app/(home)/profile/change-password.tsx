import { useUser } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

type ThemeTokens = {
  primary: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  error: string;
};

const LIGHT: ThemeTokens = {
  primary: "#753eb5",
  surface: "#fff3fe",
  surfaceContainerLow: "#fdebff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#3d2549",
  onSurfaceVariant: "#6c5279",
  outlineVariant: "#c2a2ce",
  error: "#b41340",
};

const DARK: ThemeTokens = {
  primary: "#c799ff",
  surface: "#130b1a",
  surfaceContainerLow: "#190f21",
  surfaceContainerLowest: "#000000",
  onSurface: "#f6e6fd",
  onSurfaceVariant: "#b4a6bc",
  outlineVariant: "#4f4456",
  error: "#ff6e84",
};

function normalizeDigits(input: string) {
  return input.replace(/\D+/g, "");
}

function maskPhone(phone?: string | null) {
  const digits = normalizeDigits(phone ?? "");
  if (digits.length < 4) return phone ?? "";
  const last4 = digits.slice(-4);
  return `•••• •••• ${last4}`;
}

async function sendUserPhoneOtp(user: any) {
  const phone = user?.primaryPhoneNumber ?? user?.phoneNumbers?.[0];
  if (!phone) {
    throw new Error("No phone number found on this account.");
  }

  // Prefer the newer prepareVerification API.
  if (typeof phone?.prepareVerification === "function") {
    await phone.prepareVerification({ strategy: "phone_code" });
    return;
  }

  // Fallback: some SDKs expose a nested verifications API.
  const verifications = phone?.verifications;
  if (typeof verifications?.preparePhoneNumberVerification === "function") {
    await verifications.preparePhoneNumberVerification({
      strategy: "phone_code",
    });
    return;
  }

  throw new Error(
    "Phone OTP is not supported by this Clerk SDK version. Update Clerk or enable phone verification.",
  );
}

async function verifyUserPhoneOtp(user: any, code: string) {
  const phone = user?.primaryPhoneNumber ?? user?.phoneNumbers?.[0];
  if (!phone) {
    throw new Error("No phone number found on this account.");
  }

  if (typeof phone?.attemptVerification === "function") {
    await phone.attemptVerification({ code, strategy: "phone_code" });
    return;
  }

  const verifications = phone?.verifications;
  if (typeof verifications?.attemptPhoneNumberVerification === "function") {
    await verifications.attemptPhoneNumberVerification({
      code,
      strategy: "phone_code",
    });
    return;
  }

  throw new Error(
    "Phone OTP verification is not supported by this Clerk SDK version.",
  );
}

async function updateUserPassword(user: any, newPassword: string) {
  if (typeof user?.updatePassword === "function") {
    // Some SDKs require currentPassword; OTP-gating is handled by our UI.
    await user.updatePassword({ newPassword } as any);
    return;
  }

  if (typeof user?.update === "function") {
    // Some SDKs accept password via user.update.
    await user.update({ password: newPassword } as any);
    return;
  }

  throw new Error(
    "Password update is not supported by this Clerk SDK version.",
  );
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? DARK : LIGHT;

  const { user, isLoaded } = useUser();

  const phone =
    user?.primaryPhoneNumber?.phoneNumber ??
    user?.phoneNumbers?.[0]?.phoneNumber;
  const maskedPhone = useMemo(() => maskPhone(phone), [phone]);

  const [otpSent, setOtpSent] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => ""),
  );
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Reset OTP once verified state flips back.
    if (!otpSent) {
      setOtpDigits(Array.from({ length: 6 }, () => ""));
      setOtpVerified(false);
    }
  }, [otpSent]);

  const otpCode = otpDigits.join("");
  const canSendOtp = isLoaded && Boolean(user) && Boolean(phone) && !otpBusy;
  const canVerifyOtp = otpSent && otpCode.length === 6 && !otpBusy;

  const canUpdatePassword =
    otpVerified &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !busy &&
    Boolean(user);

  const setOtpDigit = (index: number, value: string) => {
    const digit = normalizeDigits(value).slice(-1);
    setOtpDigits((current) => {
      const next = current.slice();
      next[index] = digit;
      return next;
    });

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const sendOtp = async () => {
    if (!user) return;
    setOtpBusy(true);
    try {
      await sendUserPhoneOtp(user as any);
      setOtpSent(true);
      setOtpDigits(Array.from({ length: 6 }, () => ""));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      const msg =
        typeof e?.message === "string" ? e.message : "Failed to send OTP.";
      Alert.alert("OTP not sent", msg);
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!user) return;
    if (otpCode.length !== 6) {
      Alert.alert("Invalid code", "Please enter the 6-digit OTP.");
      return;
    }

    setOtpBusy(true);
    try {
      await verifyUserPhoneOtp(user as any, otpCode);
      setOtpVerified(true);
      Alert.alert("Verified", "Phone verification successful.");
    } catch (e: any) {
      const msg =
        typeof e?.message === "string" ? e.message : "OTP verification failed.";
      Alert.alert("Verification failed", msg);
    } finally {
      setOtpBusy(false);
    }
  };

  const savePassword = async () => {
    if (!user) return;

    if (!otpVerified) {
      Alert.alert("Verify your phone", "Complete OTP verification first.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Weak password", "Use at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords don’t match",
        "Please re-enter the same password.",
      );
      return;
    }

    setBusy(true);
    try {
      await updateUserPassword(user as any, newPassword);
      Alert.alert("Updated", "Your password has been changed.");
      router.back();
    } catch (e: any) {
      const msg =
        typeof e?.message === "string"
          ? e.message
          : "Failed to update password.";
      Alert.alert("Couldn’t update", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={[]}
    >
      <View
        style={{ paddingTop: Math.max(insets.top, 0) }}
        className="px-6 pb-4 pt-3"
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={colors.onSurface}
            />
          </Pressable>
          <Text
            className="font-headline text-xl tracking-tight"
            style={{ color: colors.onSurface }}
          >
            Change Password
          </Text>
        </View>
        <Text
          className="mt-2 font-body"
          style={{ color: colors.onSurfaceVariant }}
        >
          Requires Mobile OTP Verification.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10"
        contentContainerStyle={{
          paddingBottom: 32 + Math.max(insets.bottom, 0),
        }}
      >
        <View
          style={{
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: 20,
          }}
          className="mt-6 p-6"
        >
          <Text
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: colors.onSurfaceVariant }}
          >
            Mobile Verification
          </Text>

          <Text
            className="mt-2 font-body font-semibold"
            style={{ color: colors.onSurface }}
          >
            {phone ? `Sent to ${maskedPhone}` : "No phone number on file"}
          </Text>

          <Pressable
            onPress={sendOtp}
            disabled={!canSendOtp}
            accessibilityRole="button"
            accessibilityLabel="Send OTP"
            className="mt-4 items-center justify-center rounded-full px-6 py-4"
            style={{
              backgroundColor: canSendOtp
                ? colors.primary
                : `${colors.outlineVariant}33`,
            }}
          >
            <Text
              className="font-headline text-base font-bold"
              style={{ color: isDark ? "#130b1a" : "#faefff" }}
            >
              {otpBusy ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
            </Text>
          </Pressable>

          {otpSent ? (
            <View className="mt-6">
              <Text
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: colors.onSurfaceVariant }}
              >
                Enter OTP
              </Text>
              <View className="mt-3 flex-row justify-between">
                {otpDigits.map((d, idx) => (
                  <TextInput
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    value={d}
                    onChangeText={(v) => setOtpDigit(idx, v)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    style={{
                      width: 44,
                      height: 52,
                      borderRadius: 14,
                      backgroundColor: colors.surfaceContainerLowest,
                      color: colors.onSurface,
                      fontSize: 18,
                      fontWeight: "800",
                      borderWidth: 1,
                      borderColor: otpVerified
                        ? colors.primary
                        : `${colors.outlineVariant}33`,
                    }}
                    accessibilityLabel={`OTP digit ${idx + 1}`}
                  />
                ))}
              </View>

              <Pressable
                onPress={verifyOtp}
                disabled={!canVerifyOtp}
                accessibilityRole="button"
                accessibilityLabel="Verify OTP"
                className="mt-5 items-center justify-center rounded-full px-6 py-4"
                style={{
                  backgroundColor: canVerifyOtp
                    ? colors.surfaceContainerLowest
                    : `${colors.outlineVariant}33`,
                  borderWidth: 2,
                  borderColor: canVerifyOtp
                    ? `${colors.primary}33`
                    : "transparent",
                }}
              >
                <Text
                  className="font-headline text-base font-bold"
                  style={{
                    color: canVerifyOtp
                      ? colors.primary
                      : colors.onSurfaceVariant,
                  }}
                >
                  {otpBusy
                    ? "Verifying…"
                    : otpVerified
                      ? "Verified"
                      : "Confirm Verification"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View
          style={{
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: 20,
          }}
          className="mt-6 p-6"
        >
          <Text
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: colors.onSurfaceVariant }}
          >
            New Password
          </Text>

          <View
            className="mt-3 flex-row items-center px-4 py-4"
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: 16,
            }}
          >
            <MaterialIcons name="lock" size={18} color={colors.primary} />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password (min 8 chars)"
              placeholderTextColor={`${colors.onSurfaceVariant}99`}
              secureTextEntry
              style={{
                flex: 1,
                marginLeft: 10,
                color: colors.onSurface,
                fontSize: 16,
                fontWeight: "600",
              }}
            />
          </View>

          <View
            className="mt-3 flex-row items-center px-4 py-4"
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: 16,
            }}
          >
            <MaterialIcons
              name="lock-outline"
              size={18}
              color={colors.primary}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={`${colors.onSurfaceVariant}99`}
              secureTextEntry
              style={{
                flex: 1,
                marginLeft: 10,
                color: colors.onSurface,
                fontSize: 16,
                fontWeight: "600",
              }}
            />
          </View>

          <Text
            className="mt-3 font-body text-sm"
            style={{ color: colors.onSurfaceVariant }}
          >
            {otpVerified
              ? "OTP verified — you can update your password."
              : "Verify OTP to enable password change."}
          </Text>

          <Pressable
            onPress={savePassword}
            disabled={!canUpdatePassword}
            accessibilityRole="button"
            accessibilityLabel="Update password"
            className="mt-5 items-center justify-center rounded-full px-6 py-4"
            style={{
              backgroundColor: canUpdatePassword
                ? colors.primary
                : `${colors.outlineVariant}33`,
            }}
          >
            <Text
              className="font-headline text-base font-bold"
              style={{ color: isDark ? "#130b1a" : "#faefff" }}
            >
              {busy ? "Updating…" : "Update Password"}
            </Text>
          </Pressable>

          {newPassword && confirmPassword && newPassword !== confirmPassword ? (
            <Text
              className="mt-3 font-body text-sm"
              style={{ color: colors.error }}
            >
              Passwords don’t match.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
