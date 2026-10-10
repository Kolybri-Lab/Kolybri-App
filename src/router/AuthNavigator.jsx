import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import StyleMask from "@/components/display/StyleMask";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import ErrorToast from "@/components/error/ErrorToast";
import NetworkBanner from "@/components/error/NetworkBanner";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useActiveThemeMode, useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import SplashScreen from "@/screens/Splash/SplashScreen";
import authService from "@/services/login/authService";
import {
    tryLoginWithStoredCreds,
    tryRestoreToken,
} from "@/services/login/tools/bootstrapAsync";
import { toNavigationTheme } from "@/themes/navigation";
import { StatusBar } from "react-native";
import Auth from "./display/auth/Auth";
import Client from "./display/client/Client";

export default function AuthNavigator() {
    const activeMode = useActiveThemeMode();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isBooting = useAuthStore((state) => state.isBooting);

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const credentials = await authService.restoreCredentials();
                const hasCipher = Boolean(credentials?.cipherText);
                const hasLoginCreds = Boolean(credentials?.password);
                const cachedProfile = useUserStore.getState().profile;

                if (hasCipher) {
                    const success = await tryLoginWithStoredCreds({
                        cipherText: credentials.cipherText,
                    });
                    if (success) return;
                }

                if (hasLoginCreds || cachedProfile) {
                    if (cachedProfile && !useUserStore.getState().profile) {
                        useUserStore.getState().setProfile(cachedProfile);
                    }
                    useAuthStore.getState().setAuthenticated(true);
                    useAuthStore.getState().setBooting(false);

                    if (hasLoginCreds) {
                        tryRestoreToken({
                            credentialsPassword: credentials.password,
                        }).catch((err) => {
                            console.warn(
                                "Échec du rafraîchissement du token en arrière-plan :",
                                err
                            );
                        });
                    }
                    return;
                }

                useAuthStore.getState().setAuthenticated(false);
                useAuthStore.getState().setBooting(false);
            } catch (error) {
                console.error("ERROR IN BOOTSTRAPASYNC", error);
                useAuthStore.getState().setAuthenticated(false);
                useAuthStore.getState().setBooting(false);
            }
        };

        bootstrapAsync();
    }, []);

    const theme = useTheme();
    const navTheme = useMemo(() => toNavigationTheme(theme), [theme]);
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ErrorBoundary>
                <StatusBar
                    barStyle={theme.isDark ? "light-content" : "dark-content"}
                    backgroundColor="transparent"
                    animated
                    translucent
                />
                <NavigationContainer theme={navTheme}>
                    {isBooting ? (
                        <SplashScreen />
                    ) : isAuthenticated ? (
                        <StyleMask>
                            <Client />
                        </StyleMask>
                    ) : (
                        <Auth />
                    )}
                </NavigationContainer>
                {isAuthenticated && !isBooting && (
                    <>
                        <NetworkBanner />
                        <ErrorToast />
                    </>
                )}
            </ErrorBoundary>
        </GestureHandlerRootView>
    );
}
