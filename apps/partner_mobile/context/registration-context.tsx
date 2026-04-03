import React from "react";

const PARTNER_PLATFORMS = ["Swiggy", "Zomato", "Blinkit", "Uber"] as const;
export type PartnerPlatform = (typeof PARTNER_PLATFORMS)[number];

type RegistrationState = {
  // Step 1 (light)
  fullName: string;
  profilePhotoUri: string | null;
  photoConfirmationChecked: boolean;

  // Step 1 (dark)
  firstName: string;
  lastName: string;
  emailAddress: string;

  // Work
  partnerPlatform: PartnerPlatform;
  operatingCity: string;
  partnerPlatformUserId: string;
  platformIdVerified: boolean;
  avgDailyDutyHours: string;
  avgWeeklyIncome: string;

  // Step 2
  countryCode: string; // e.g. +91
  phoneNationalNumber: string; // digits only
  otpDigits: string[]; // length 6
  otpSent: boolean;
  resendAvailableAt: number | null;

  // Step 3
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

type RegistrationContextValue = {
  state: RegistrationState;
  setState: React.Dispatch<React.SetStateAction<RegistrationState>>;
  partnerPlatforms: readonly PartnerPlatform[];
  phoneE164: string;
  verifyPartnerIdLocally: () => void;
  setOtpDigit: (index: number, value: string) => void;
  clearOtp: () => void;
};

const RegistrationContext =
  React.createContext<RegistrationContextValue | null>(null);

const initialState: RegistrationState = {
  fullName: "",
  profilePhotoUri: null,
  photoConfirmationChecked: false,

  firstName: "",
  lastName: "",
  emailAddress: "",

  partnerPlatform: "Swiggy",
  operatingCity: "",
  partnerPlatformUserId: "",
  platformIdVerified: false,
  avgDailyDutyHours: "",
  avgWeeklyIncome: "",

  countryCode: "+91",
  phoneNationalNumber: "",
  otpDigits: Array.from({ length: 6 }, () => ""),
  otpSent: false,
  resendAvailableAt: null,

  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

function normalizeDigits(input: string) {
  return input.replace(/\D+/g, "");
}

function formatE164(countryCode: string, nationalNumber: string) {
  const cc = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  const nn = normalizeDigits(nationalNumber);
  return `${cc}${nn}`;
}

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<RegistrationState>(initialState);

  const phoneE164 = React.useMemo(
    () => formatE164(state.countryCode, state.phoneNationalNumber),
    [state.countryCode, state.phoneNationalNumber],
  );

  const verifyPartnerIdLocally = React.useCallback(() => {
    setState((current) => {
      const candidate = current.partnerPlatformUserId.trim();
      const looksValid = candidate.length >= 6;
      return { ...current, platformIdVerified: looksValid };
    });
  }, []);

  const setOtpDigit = React.useCallback((index: number, value: string) => {
    const digit = normalizeDigits(value).slice(-1);
    setState((current) => {
      const next = current.otpDigits.slice();
      next[index] = digit;
      return { ...current, otpDigits: next };
    });
  }, []);

  const clearOtp = React.useCallback(() => {
    setState((current) => ({
      ...current,
      otpDigits: Array.from({ length: 6 }, () => ""),
    }));
  }, []);

  const value = React.useMemo<RegistrationContextValue>(
    () => ({
      state,
      setState,
      partnerPlatforms: PARTNER_PLATFORMS,
      phoneE164,
      verifyPartnerIdLocally,
      setOtpDigit,
      clearOtp,
    }),
    [state, phoneE164, verifyPartnerIdLocally, setOtpDigit, clearOtp],
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = React.useContext(RegistrationContext);
  if (!ctx) {
    throw new Error("useRegistration must be used within RegistrationProvider");
  }
  return ctx;
}
