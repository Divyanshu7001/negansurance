import React from "react";

export type IncidentTypeId =
  | "heavy_rain"
  | "flash_flood"
  | "traffic_jam"
  | "protest"
  | "road_closure"
  | "other";

export type IncidentType = {
  id: IncidentTypeId;
  title: string;
  description: string;
  icon:
    | "weather-pouring"
    | "waves"
    | "traffic-light"
    | "account-group"
    | "block-helper"
    | "help-circle-outline";
};

export type RecentOrder = {
  id: string;
  locationName: string;
  gpsLabel: string;
  timeLabel: string;
};

export type ClaimSubmissionStatus =
  | { state: "idle" }
  | { state: "submitting" }
  | {
      state: "done";
      ok: boolean;
      incidentTitle: string;
      claimId: string;
      estimatedPayout: number;
      message?: string;
    };

const INCIDENT_TYPES: IncidentType[] = [
  {
    id: "heavy_rain",
    title: "Heavy Rain",
    description:
      "Visibility issues or storm conditions preventing safe operation.",
    icon: "weather-pouring",
  },
  {
    id: "flash_flood",
    title: "Flash Flood",
    description: "Water accumulation on roadways making them impassable.",
    icon: "waves",
  },
  {
    id: "traffic_jam",
    title: "Traffic Jam",
    description: "Severe congestion causing delays exceeding 30 minutes.",
    icon: "traffic-light",
  },
  {
    id: "protest",
    title: "Protest / Social Issue",
    description: "Public demonstrations affecting your primary route safely.",
    icon: "account-group",
  },
  {
    id: "road_closure",
    title: "Road Closure / Curfew",
    description:
      "Official restrictions preventing access to your delivery zone.",
    icon: "block-helper",
  },
  {
    id: "other",
    title: "Other",
    description: "Any other situation not listed above that disrupts work.",
    icon: "help-circle-outline",
  },
];

const RECENT_ORDERS: RecentOrder[] = [
  {
    id: "ORD-10314",
    locationName: "Downtown, Mumbai",
    gpsLabel: "GPS: 18.9220 N, 72.8347 E",
    timeLabel: "14:30, Today",
  },
  {
    id: "ORD-10315",
    locationName: "Bandra West, Mumbai",
    gpsLabel: "GPS: 19.0596 N, 72.8295 E",
    timeLabel: "13:55, Today",
  },
  {
    id: "ORD-10316",
    locationName: "Andheri East, Mumbai",
    gpsLabel: "GPS: 19.1136 N, 72.8697 E",
    timeLabel: "13:10, Today",
  },
];

type IncidentReportState = {
  incidentTypeId: IncidentTypeId | null;
  orderId: string | null;
  description: string;
  photoUri: string | null;
  submission: ClaimSubmissionStatus;
};

type IncidentReportContextValue = {
  incidentTypes: IncidentType[];
  recentOrders: RecentOrder[];
  state: IncidentReportState;
  selectedIncident: IncidentType | null;
  selectedOrder: RecentOrder | null;
  setIncidentType: (id: IncidentTypeId) => void;
  setOrderId: (id: string) => void;
  setDescription: (v: string) => void;
  setPhotoUri: (uri: string | null) => void;
  resetSubmission: () => void;
  reset: () => void;
  submitClaim: () => Promise<void>;
};

const IncidentReportContext =
  React.createContext<IncidentReportContextValue | null>(null);

function generateClaimId() {
  const num = Math.floor(10000 + Math.random() * 89999);
  return `#NEG-CLM-${num}`;
}

function estimatePayout(incidentTypeId: IncidentTypeId) {
  switch (incidentTypeId) {
    case "heavy_rain":
      return 120;
    case "flash_flood":
      return 150;
    case "traffic_jam":
      return 150;
    case "protest":
      return 100;
    case "road_closure":
      return 130;
    case "other":
    default:
      return 90;
  }
}

export function IncidentReportProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<IncidentReportState>({
    incidentTypeId: null,
    orderId: RECENT_ORDERS[0]?.id ?? null,
    description: "",
    photoUri: null,
    submission: { state: "idle" },
  });

  const selectedIncident = React.useMemo(() => {
    return INCIDENT_TYPES.find((i) => i.id === state.incidentTypeId) ?? null;
  }, [state.incidentTypeId]);

  const selectedOrder = React.useMemo(() => {
    return RECENT_ORDERS.find((o) => o.id === state.orderId) ?? null;
  }, [state.orderId]);

  const setIncidentType = React.useCallback((id: IncidentTypeId) => {
    setState((s) => ({ ...s, incidentTypeId: id }));
  }, []);

  const setOrderId = React.useCallback((id: string) => {
    setState((s) => ({ ...s, orderId: id }));
  }, []);

  const setDescription = React.useCallback((v: string) => {
    setState((s) => ({ ...s, description: v }));
  }, []);

  const setPhotoUri = React.useCallback((uri: string | null) => {
    setState((s) => ({ ...s, photoUri: uri }));
  }, []);

  const resetSubmission = React.useCallback(() => {
    setState((s) => ({ ...s, submission: { state: "idle" } }));
  }, []);

  const reset = React.useCallback(() => {
    setState({
      incidentTypeId: null,
      orderId: RECENT_ORDERS[0]?.id ?? null,
      description: "",
      photoUri: null,
      submission: { state: "idle" },
    });
  }, []);

  const submitClaim = React.useCallback(async () => {
    setState((s) => ({ ...s, submission: { state: "submitting" } }));

    // Simulate API call.
    await new Promise((r) => setTimeout(r, 900));

    setState((s) => {
      const incident = INCIDENT_TYPES.find((i) => i.id === s.incidentTypeId);
      const incidentTitle = incident?.title ?? "Incident";

      // Demo: inject a realistic failure path (network or validation).
      const shouldFail = Math.random() < 0.12;
      if (shouldFail) {
        return {
          ...s,
          submission: {
            state: "done",
            ok: false,
            incidentTitle,
            claimId: generateClaimId(),
            estimatedPayout: estimatePayout(s.incidentTypeId ?? "other"),
            message:
              "We couldn't submit your claim right now. Please try again in a moment.",
          },
        };
      }

      return {
        ...s,
        submission: {
          state: "done",
          ok: true,
          incidentTitle,
          claimId: generateClaimId(),
          estimatedPayout: estimatePayout(s.incidentTypeId ?? "other"),
        },
      };
    });
  }, []);

  const value = React.useMemo<IncidentReportContextValue>(
    () => ({
      incidentTypes: INCIDENT_TYPES,
      recentOrders: RECENT_ORDERS,
      state,
      selectedIncident,
      selectedOrder,
      setIncidentType,
      setOrderId,
      setDescription,
      setPhotoUri,
      resetSubmission,
      reset,
      submitClaim,
    }),
    [
      state,
      selectedIncident,
      selectedOrder,
      setIncidentType,
      setOrderId,
      setDescription,
      setPhotoUri,
      resetSubmission,
      reset,
      submitClaim,
    ],
  );

  return React.createElement(
    IncidentReportContext.Provider,
    { value },
    children,
  );
}

export function useIncidentReport() {
  const ctx = React.useContext(IncidentReportContext);
  if (!ctx) {
    throw new Error(
      "useIncidentReport must be used within IncidentReportProvider",
    );
  }
  return ctx;
}
