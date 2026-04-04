import { Stack } from "expo-router";

import { IncidentReportProvider } from "@/context/reportIncident-context";

export default function ReportIncidentLayout() {
  return (
    <IncidentReportProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="details" />
        <Stack.Screen name="result" />
      </Stack>
    </IncidentReportProvider>
  );
}
