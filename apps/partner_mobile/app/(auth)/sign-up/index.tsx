import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, Redirect, useRouter } from "expo-router";
import React from "react";
import {
  Appearance,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import {
  type PartnerPlatform,
  useRegistration,
} from "@/context/registration-context";

const LIGHT_PRIMARY = "#753eb5";
const DARK_PRIMARY = "#c799ff";
const LIGHT_ON_PRIMARY = "#faefff";

const PROFILE_PLACEHOLDER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBl2lWpTIW6vBnDlBSuIf8kkGZ4OUuMbQCEaacv799HKTOYcl2gLERivWT_sRVzE4rRW3nzWedQfLLP_tbRvGIBll_A8Mvc6Ui24avydaf2fmgpUhg2JJU7-w7o1QuiBrU5AvAb6QZJ9_9qBupXRt19zLfRQb76rzy5q_zLThD4Ayn6r7oGc79xQwq-A8bmauFv1wDXQnVn-0DkqrtCMWSJ_75vhSJaQIAEIbk2dHa2DDQOty3R3oVVemUNdFLo9NagddBdFzEVzvlp";

export default function RegistrationStep1() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme();
  Appearance.setColorScheme("dark");
  const isDark = scheme === "dark";
  const { state, setState, partnerPlatforms, verifyPartnerIdLocally } =
    useRegistration();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }

  const canContinue =
    state.fullName.trim().length > 1 &&
    state.operatingCity.trim().length > 1 &&
    state.partnerPlatformUserId.trim().length > 1 &&
    state.avgDailyDutyHours.trim().length > 0 &&
    state.avgWeeklyIncome.trim().length > 0;
  // state.photoConfirmationChecked;
  const primary = isDark ? DARK_PRIMARY : LIGHT_PRIMARY;

  const handleContinue = () => {
    router.push("/sign-up/verify-email" as Href);
  };

  return (
    <View className="flex-1 bg-surface">
      <TopBar
        title={isDark ? "Create Account" : "Negansurance"}
        iconColor={primary}
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-24 pt-24"
      >
        <LightProgress label="Profile & Work Details" activeSegment={1} />

        <View className="mb-8">
          <Text className="font-headline text-4xl tracking-tight text-on-background">
            Let&apos;s get you{"\n"}
            <GradientWord text="protected" primary={primary} />
            <Text className="text-on-background">.</Text>
          </Text>
          <Text className="mt-3 font-body text-on-surface-variant">
            Complete your profile to unlock custom insurance plans built for
            your hustle.
          </Text>
        </View>

        <LightPersonalAndWork
          // profileUri={state.profilePhotoUri ?? PROFILE_PLACEHOLDER}
          fullName={state.fullName}
          onChangeFullName={(v) => setState((s) => ({ ...s, fullName: v }))}
          partnerPlatform={state.partnerPlatform}
          partnerPlatforms={partnerPlatforms}
          onChangePartnerPlatform={(v) =>
            setState((s) => ({ ...s, partnerPlatform: v }))
          }
          operatingCity={state.operatingCity}
          onChangeOperatingCity={(v) =>
            setState((s) => ({ ...s, operatingCity: v }))
          }
          partnerPlatformUserId={state.partnerPlatformUserId}
          platformIdVerified={state.platformIdVerified}
          onChangePartnerPlatformUserId={(v) =>
            setState((s) => ({
              ...s,
              partnerPlatformUserId: v,
              platformIdVerified: false,
            }))
          }
          onVerifyPartnerId={verifyPartnerIdLocally}
          avgDailyDutyHours={state.avgDailyDutyHours}
          onChangeAvgDailyDutyHours={(v) =>
            setState((s) => ({ ...s, avgDailyDutyHours: v }))
          }
          avgWeeklyIncome={state.avgWeeklyIncome}
          onChangeAvgWeeklyIncome={(v) =>
            setState((s) => ({ ...s, avgWeeklyIncome: v }))
          }
          photoConfirmationChecked={state.photoConfirmationChecked}
          onTogglePhotoConfirmation={() =>
            setState((s) => ({
              ...s,
              photoConfirmationChecked: !s.photoConfirmationChecked,
            }))
          }
        />

        <View className="mt-6">
          <PrimaryButton
            label="Next: Verification"
            disabled={!canContinue}
            onPress={handleContinue}
          />
          <Text className="mt-6 text-center font-label text-xs uppercase tracking-widest text-on-surface-variant">
            Secured by 256-bit Encryption
          </Text>
        </View>

        {/* Required for sign-up flows. Clerk's bot sign-up protection can be enabled by default */}
        <View nativeID="clerk-captcha" />
      </ScrollView>
    </View>
  );
}

function TopBar({
  title,
  iconColor,
  onBack,
}: {
  title: string;
  iconColor: string;
  onBack: () => void;
}) {
  return (
    <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center gap-3 bg-surface/80 px-6 pb-4 pt-12">
      <Pressable
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <MaterialIcons name="arrow-back" size={22} color={iconColor} />
      </Pressable>
      <Text className="font-headline text-xl tracking-tight text-primary">
        {title}
      </Text>
    </View>
  );
}

function LightProgress({
  label,
  activeSegment,
}: {
  label: string;
  activeSegment: 1 | 2 | 3;
}) {
  return (
    <View className="mt-2 mb-10">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-label text-sm font-bold uppercase tracking-widest text-primary">
          Step {activeSegment} of 3
        </Text>
        <Text className="text-xs font-medium text-on-surface-variant">
          {label}
        </Text>
      </View>
      <View className="h-1.5 w-full flex-row overflow-hidden rounded-full bg-outline-variant/30">
        <View
          className={`h-full ${activeSegment >= 1 ? "bg-primary" : "bg-surface-dim"}`}
          style={{ width: "33.333%" }}
        />
        <View
          className={`h-full ${activeSegment >= 2 ? "bg-primary" : "bg-surface-dim"}`}
          style={{ width: "33.333%" }}
        />
        <View
          className={`h-full ${activeSegment >= 3 ? "bg-primary" : "bg-surface-dim"}`}
          style={{ width: "33.333%" }}
        />
      </View>
    </View>
  );
}

function GradientWord({ text, primary }: { text: string; primary: string }) {
  return (
    <MaskedView
      maskElement={
        <Text className="font-headline text-4xl tracking-tight text-on-background">
          {text}
        </Text>
      }
    >
      <LinearGradient
        colors={[primary, "#bd87ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text
          className="font-headline text-4xl tracking-tight"
          style={{ opacity: 0 }}
        >
          {text}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient-soft">
      <View className="mb-4 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest">
          {icon}
        </View>
        <Text className="font-headline text-lg text-on-surface">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="ml-1 font-label text-xs font-bold uppercase text-on-surface-variant">
        {label}
      </Text>
      {children}
    </View>
  );
}

function LightPersonalAndWork(props: {
  // profileUri: string;
  fullName: string;
  onChangeFullName: (v: string) => void;
  partnerPlatform: PartnerPlatform;
  partnerPlatforms: readonly PartnerPlatform[];
  onChangePartnerPlatform: (v: PartnerPlatform) => void;
  operatingCity: string;
  onChangeOperatingCity: (v: string) => void;
  partnerPlatformUserId: string;
  platformIdVerified: boolean;
  onChangePartnerPlatformUserId: (v: string) => void;
  onVerifyPartnerId: () => void;
  avgDailyDutyHours: string;
  onChangeAvgDailyDutyHours: (v: string) => void;
  avgWeeklyIncome: string;
  onChangeAvgWeeklyIncome: (v: string) => void;
  photoConfirmationChecked: boolean;
  onTogglePhotoConfirmation: () => void;
}) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const iconColor = isDark ? DARK_PRIMARY : LIGHT_PRIMARY;
  const placeholderTextColor = isDark ? undefined : "#896d95";

  return (
    <View className="gap-6">
      <Card
        title="Personal Information"
        icon={
          <MaterialIcons name="person-outline" size={20} color={iconColor} />
        }
      >
        <View className="gap-6">
          <View className="rounded-xl bg-surface-container-low p-4">
            <View className="flex-row items-center gap-6">
              <View className="relative">
                <View className="h-24 w-24 overflow-hidden rounded-full bg-surface-dim ring-4 ring-surface-container-lowest">
                  <Image
                    source={{ uri: PROFILE_PLACEHOLDER }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </View>
                <Pressable className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <MaterialIcons
                    name="photo-camera"
                    size={18}
                    color={LIGHT_ON_PRIMARY}
                  />
                </Pressable>
              </View>
              <View className="flex-1">
                <Text className="font-label text-base text-on-surface">
                  Official Profile Photo
                </Text>
                <Text className="mt-1 text-xs text-on-surface-variant">
                  This will be used for your Digital ID and Policy documents.
                </Text>
              </View>
            </View>
          </View>

          <Field label="Full Name (As per Aadhar)">
            <TextInput
              className="rounded-xl bg-surface-container-low px-5 py-4 font-body text-on-surface"
              placeholder="e.g. Alex Gigson"
              placeholderTextColor={placeholderTextColor}
              value={props.fullName}
              onChangeText={props.onChangeFullName}
            />
          </Field>
        </View>
      </Card>

      <Card
        title="Professional Hustle"
        icon={
          <MaterialIcons name="delivery-dining" size={20} color={iconColor} />
        }
      >
        <View className="gap-6">
          <Field label="Partner Platform">
            <View className="rounded-xl bg-surface-container-low px-5 py-4">
              <Text className="font-body text-on-surface">
                {props.partnerPlatform}
              </Text>
            </View>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {props.partnerPlatforms.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => props.onChangePartnerPlatform(p)}
                  className={`rounded-full px-4 py-2 ${
                    p === props.partnerPlatform
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface"
                  }`}
                >
                  <Text
                    className={`font-label text-xs ${
                      p === props.partnerPlatform
                        ? "text-on-primary"
                        : "text-on-surface"
                    }`}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Operating City">
            <TextInput
              className="rounded-xl bg-surface-container-low px-5 py-4 font-body text-on-surface"
              placeholder="e.g. Mumbai"
              placeholderTextColor={placeholderTextColor}
              value={props.operatingCity}
              onChangeText={props.onChangeOperatingCity}
            />
          </Field>

          <Field label="Partner Platform User ID">
            <View className="flex-row gap-2">
              <View className="flex-1 rounded-xl bg-surface-container-low px-5 py-4">
                <View className="flex-row items-center justify-between">
                  <TextInput
                    className="flex-1 font-body text-on-surface"
                    value={props.partnerPlatformUserId}
                    onChangeText={props.onChangePartnerPlatformUserId}
                    placeholder="e.g. SW-10928374"
                    placeholderTextColor={placeholderTextColor}
                  />
                  {props.platformIdVerified ? (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#006b25"
                    />
                  ) : null}
                </View>
              </View>
              <Pressable
                onPress={props.onVerifyPartnerId}
                className="items-center justify-center rounded-xl bg-secondary-container px-5"
              >
                <Text className="font-label text-xs text-on-secondary-container">
                  {props.platformIdVerified ? "Verified" : "Verify"}
                </Text>
              </Pressable>
            </View>
          </Field>

          <Field label="Avg. Daily Duty (Hrs)">
            <View className="relative rounded-xl bg-surface-container-low px-5 py-4">
              <TextInput
                className="font-body text-on-surface"
                placeholder="8"
                placeholderTextColor={placeholderTextColor}
                keyboardType="numeric"
                value={props.avgDailyDutyHours}
                onChangeText={props.onChangeAvgDailyDutyHours}
              />
              <Text className="absolute right-4 top-4 text-xs font-bold text-outline">
                HOURS
              </Text>
            </View>
          </Field>

          <Field label="Avg. Weekly Income">
            <View className="flex-row items-center rounded-xl bg-surface-container-low px-5 py-4">
              <Text className="mr-2 font-label text-on-surface-variant">₹</Text>
              <TextInput
                className="flex-1 font-body text-on-surface"
                placeholder="7,500"
                placeholderTextColor={placeholderTextColor}
                value={props.avgWeeklyIncome}
                onChangeText={props.onChangeAvgWeeklyIncome}
              />
            </View>
          </Field>
        </View>
      </Card>

      <Pressable
        onPress={props.onTogglePhotoConfirmation}
        className="flex-row items-start gap-4 rounded-xl p-4"
      >
        <View
          className={`mt-1 h-6 w-6 items-center justify-center rounded-md border-2 ${
            props.photoConfirmationChecked
              ? "border-primary bg-primary"
              : "border-outline-variant"
          }`}
        >
          {props.photoConfirmationChecked ? (
            <MaterialIcons name="check" size={16} color="#ffffff" />
          ) : null}
        </View>
        <Text className="flex-1 font-body text-sm leading-relaxed text-on-surface-variant">
          I confirm that the uploaded photo matches my official Government ID
          and Partner Platform records. I understand this is used for claim
          verification.
        </Text>
      </Pressable>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`w-full flex-row items-center justify-center gap-3 rounded-full bg-primary py-5 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <Text className="font-headline text-lg text-on-primary">{label}</Text>
      <MaterialIcons name="arrow-forward" size={20} color={LIGHT_ON_PRIMARY} />
    </Pressable>
  );
}
