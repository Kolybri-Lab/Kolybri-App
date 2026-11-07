import {
    createNavigationContainerRef,
    getActionFromState,
    getStateFromPath,
} from "@react-navigation/native";
import { linking } from "./config/routesNames";

export const navigationRef = createNavigationContainerRef();

/**
 * Resolves an internal deep link using the official linking config.
 */
export function navigateFromUrl(url) {
    if (!url || !navigationRef.isReady()) return false;

    const cleanPath = url
        .replace(/^kolybri(-dev|-preview)?:\/\//, "")
        .replace(/^app:\/\//, "")
        .replace(/^\/+/, "");

    const state = getStateFromPath(cleanPath, linking.config);
    if (!state) return false;

    const action = getActionFromState(state, linking.config);
    if (action) {
        navigationRef.dispatch(action);
        return true;
    }

    navigationRef.resetRoot(state);
    return true;
}

