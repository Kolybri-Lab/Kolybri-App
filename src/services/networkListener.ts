// services/networkListeners.ts
import { useNetworkStore } from "@/hooks/useNetworkStore";
import { focusManager, onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { AppState, Platform, type AppStateStatus } from "react-native";

let networkSubscription: { remove: () => void } | null = null;
let appStateSubscription: { remove: () => void } | null = null;

export async function initNetworkListeners() {
    // init: initial state when the app starts
    try {
        const connectionStatus = await Network.getNetworkStateAsync();
        const airplaneStatus = await Network.isAirplaneModeEnabledAsync();
        const isOnline =
            !!connectionStatus.isConnected && !!connectionStatus.isInternetReachable;

        onlineManager.setOnline(isOnline);

        useNetworkStore.getState().setActiveNetworkStatus({
            isConnected: connectionStatus.isConnected ?? null,
            isInternetReachable: connectionStatus.isInternetReachable ?? null,
            type: connectionStatus.type ?? "unknown",
            inAirplaneMode: airplaneStatus,
        });
    } catch (error) {
        console.error("Error when init network:", error);
    }

    // single network listener: powers both TanStack Query and the UI store
    networkSubscription = Network.addNetworkStateListener((networkData) => {
        const isOnline =
            !!networkData.isConnected && !!networkData.isInternetReachable;

        onlineManager.setOnline(isOnline);

        useNetworkStore.getState().setActiveNetworkStatus({
            isConnected: networkData.isConnected ?? null,
            isInternetReachable: networkData.isInternetReachable ?? null,
            type: networkData.type ?? "unknown",
        });
    });

    function onAppStateChange(status: AppStateStatus) {
        if (Platform.OS !== "web") {
            focusManager.setFocused(status === "active");
        }
    }
    appStateSubscription = AppState.addEventListener("change", onAppStateChange);
}

export function teardownNetworkListeners() {
    networkSubscription?.remove();
    appStateSubscription?.remove();
    networkSubscription = null;
    appStateSubscription = null;
}
