import { Stack } from "expo-router";

import { RegistrationProvider } from "@/context/registration-context";

export default function SignUpFlowLayout() {
  return (
    <RegistrationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RegistrationProvider>
  );
}
