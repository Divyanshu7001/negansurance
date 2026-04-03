import { LocationGate } from "@/components/LocationGate";
import { useAuth } from "@clerk/expo";
import * as Location from "expo-location";
import { type Href, Redirect, Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, BackHandler, Platform } from "react-native";

export default function HomeRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  const [locationSatisfied, setLocationSatisfied] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const isMountedRef = useRef(true);

  const isGateVisible = useMemo(() => {
    return isLoaded && isSignedIn && locationChecked && !locationSatisfied;
  }, [isLoaded, isSignedIn, locationChecked, locationSatisfied]);

  const checkLocationState = useCallback(async () => {
    try {
      const [permission, servicesEnabled] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Location.hasServicesEnabledAsync(),
      ]);

      if (!isMountedRef.current) return;

      setLocationSatisfied(
        Boolean(permission.granted) && Boolean(servicesEnabled),
      );
      setLocationChecked(true);
    } catch {
      if (!isMountedRef.current) return;
      setLocationSatisfied(false);
      setLocationChecked(true);
    }
  }, []);

  const showIosCloseAppAlert = useCallback(() => {
    Alert.alert(
      "Location Required",
      "This app can’t be used without location access. Please close the app and enable location in Settings.",
      [{ text: "OK" }],
    );
  }, []);

  const exitAppOrAlert = useCallback(() => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
      return;
    }

    showIosCloseAppAlert();
  }, [showIosCloseAppAlert]);

  const requestEnableLocation = useCallback(async () => {
    setIsRequestingLocation(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        exitAppOrAlert();
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          "Turn On Location Services",
          "Location Services are turned off. Enable them to continue using the app.",
          [{ text: "OK" }],
        );
        return;
      }

      if (!isMountedRef.current) return;
      setLocationSatisfied(true);
      setLocationChecked(true);
    } catch {
      exitAppOrAlert();
    } finally {
      if (isMountedRef.current) {
        setIsRequestingLocation(false);
      }
    }
  }, [exitAppOrAlert]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    checkLocationState();
  }, [checkLocationState, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        checkLocationState();
      }
    });

    return () => sub.remove();
  }, [checkLocationState, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isGateVisible) return;
    if (Platform.OS !== "android") return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [isGateVisible]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/" as Href} />;
  }

  if (!locationChecked) {
    return null;
  }

  if (!locationSatisfied) {
    return (
      <LocationGate
        isRequesting={isRequestingLocation}
        onEnable={requestEnableLocation}
        onExit={exitAppOrAlert}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="coming-soon" />
    </Stack>
  );
}
