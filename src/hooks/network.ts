import { useNetworkStore } from "./useNetworkStore";
import { NetworkInfo } from "@/types";

export const useNetwork = (): NetworkInfo => {
    const activeNetworkStatus = useNetworkStore((state) => state.activeNetworkStatus);

    return {
        isConnected: activeNetworkStatus.isConnected ?? false,
        isInternetReachable: activeNetworkStatus.isInternetReachable ?? false,
        type: activeNetworkStatus.type ?? "unknown",
        inAirplaneMode: activeNetworkStatus.inAirplaneMode ?? false,
        isOnline:
            (activeNetworkStatus.isConnected &&
                activeNetworkStatus.isInternetReachable) ??
            false,
    };
};
