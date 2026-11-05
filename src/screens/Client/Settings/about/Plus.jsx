import { Section, Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useRef, useState } from "react";
import { Animated, Platform, View } from "react-native";
import SettingSectionLayout from "../components/SettingSectionLayout";

const TAP_THRESHOLD = 5;
const TAP_TIMEOUT = 250;

export default function PlusScreen({ route }) {
    const { label } = route.params;
    const { colors } = useTheme();

    const { major, minor, patch } = Platform.constants.reactNativeVersion;
    const rnVersion = `${major}.${minor}.${patch}`; // ex: "0.74.5"

    const infos = {
        "Nom de l'application": Application.applicationName,
        Version: Application.nativeApplicationVersion,
        "Numéro de build": Application.nativeBuildVersion,
    };

    const debug = {
        "React Native": rnVersion,
        Expo: Constants?.expoConfig?.sdkVersion,
    };

    const infosEntries = Object.entries(infos);
    const debugEntries = Object.entries(debug);

    const tapCount = useRef(0);
    const lastTapTime = useRef(0);
    const [showToast, setShowToast] = useState(false);
    const toastOpacity = useRef(new Animated.Value(0)).current;

    const handleBuildNumberPress = () => {
        const now = Date.now();
        if (now - lastTapTime.current > TAP_TIMEOUT) {
            tapCount.current = 0;
        }
        tapCount.current += 1;
        lastTapTime.current = now;

        if (tapCount.current >= TAP_THRESHOLD) {
            tapCount.current = 0;
            triggerToast();
        }
    };

    const triggerToast = () => {
        setShowToast(true);
        Animated.sequence([
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.delay(1800),
            Animated.timing(toastOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setShowToast(false));
    };

    return (
        <SettingSectionLayout label={label}>
            <View style={{ gap: 3 }}>
                <Text
                    style={{ marginBottom: 12 }}
                    preset="label2"
                    color={colors.text.secondary}
                >
                    Informations
                </Text>
                {infosEntries.map(([key, value], index) => {
                    const isBuildNumber = key === "Numéro de build";
                    return (
                        <Section
                            key={key}
                            label={key}
                            subtitle={String(value)}
                            index={index}
                            totalLength={infosEntries.length}
                            onPress={
                                isBuildNumber ? handleBuildNumberPress : undefined
                            }
                        />
                    );
                })}
            </View>
            <View style={{ gap: 3, marginTop: 20 }}>
                <Text
                    style={{ marginBottom: 12 }}
                    color={colors.text.secondary}
                    preset="label2"
                >
                    Debug
                </Text>
                {debugEntries.map(([key, value], index) => (
                    <Section
                        key={key}
                        label={key}
                        subtitle={String(value)}
                        index={index}
                        totalLength={debugEntries.length}
                        disabled
                    />
                ))}
            </View>

            {showToast && (
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        bottom: 40,
                        alignSelf: "center",
                        backgroundColor: colors.surface.raised,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 20,
                        opacity: toastOpacity,
                    }}
                >
                    <Text preset="label1">🫣 Hey petit malin 🫣</Text>
                </Animated.View>
            )}
        </SettingSectionLayout>
    );
}
