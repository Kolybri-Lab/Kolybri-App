import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import RootProviders from "./provider";
import AuthNavigator from "./router/AuthNavigator";

import { fonts } from "assets/fonts/fonts";
import { Appearance } from "react-native";
import { useThemeStore } from "./hooks/useThemeStore";
import { setupDevMenu } from "./mock/guest/setupDevMenu";
import {
    initNetworkListeners,
    teardownNetworkListeners,
} from "./services/networkListener";
import { UpdateNotifier } from "./updates/components/UpdateNotifer";

SplashScreen.preventAutoHideAsync();

export default function App() {
    console.log(fonts);
    const [fontLoaded] = useFonts(fonts);
    const setSystemTheme = useThemeStore((s) => s.setSystemTheme);

    useEffect(() => {
        const sub = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemTheme(colorScheme ?? "dark");
        });
        return () => sub.remove();
    }, [setSystemTheme]);

    useEffect(() => {
        initNetworkListeners();
        return () => teardownNetworkListeners();
    }, []);

    useEffect(() => {
        if (__DEV__) {
            setupDevMenu();
        }
    }, []);

    useEffect(() => {
        if (fontLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontLoaded]);
    // const setFollowSystem = useThemeStore((state) => state.setFollowSystem);
    // setFollowSystem(true);
    if (!fontLoaded) return null;

    return (
        <RootProviders>
            <UpdateNotifier />
            <AuthNavigator />
        </RootProviders>
    );
}

