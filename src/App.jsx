import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import RootProviders from "./provider";
import AuthNavigator from "./router/AuthNavigator";

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
    const [fontLoaded] = useFonts({
        "Luciole-Regular": require("assets/fonts/Luciole-Regular.ttf"),
        "Lexend-Light": require("assets/fonts/Lexend-Light.ttf"),
        "Lexend-Regular": require("assets/fonts/Lexend-Regular.ttf"),
        "Lexend-Medium": require("assets/fonts/Lexend-Medium.ttf"),
        "Lexend-Bold": require("assets/fonts/Lexend-Bold.ttf"),
        Regular: require("assets/fonts/Baloo2-Regular.ttf"),
        Medium: require("assets/fonts/Baloo2-Medium.ttf"),
        SemiBold: require("assets/fonts/Baloo2-SemiBold.ttf"),
        Bold: require("assets/fonts/Baloo2-Bold.ttf"),
        ExtraBold: require("assets/fonts/Baloo2-ExtraBold.ttf"),
    });
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

