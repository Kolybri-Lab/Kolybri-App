import { Section, Switch, Text } from "@/components";
import { Lightning, Moon, Sun } from "@/components/svg";
import { useTheme, useThemeStore } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { Vibrate } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import SettingSectionLayout from "./components/SettingSectionLayout";

export default function ThemeScreen({ route }) {
    const { label } = route.params;
    const [tempState, setTempStateValue] = useState(true);

    const themeMode = useThemeStore((state) => state.themeMode);
    const setThemeMode = useThemeStore((state) => state.setThemeMode);
    const followSystem = useThemeStore((state) => state.followSystem);
    const setFollowSystem = useThemeStore((state) => state.setFollowSystem);
    const hapticsEnabled = useThemeStore((state) => state.hapticsEnabled);
    const setHapticsEnabled = useThemeStore((state) => state.setHapticsEnabled);

    const { colors } = useTheme();

    const value = followSystem ? "system" : themeMode;

    const handleChange = (id) => {
        if (id === "system") {
            setFollowSystem(true);
        } else {
            setFollowSystem(false);
            setThemeMode(id);
        }
    };

    const themeSettings = useMemo(
        () => [
            {
                label: "Thème",
                icon: <Sun fill={colors.text.primary} size={18} opacity={0.6} />,
                children: (
                    <View
                        style={{
                            alignItems: "center",
                            flexDirection: "row",
                            gap: 16,
                            borderColor: withAlpha(colors.text.primary, 0.3),

                            borderWidth: 1,
                            paddingVertical: 2,
                            paddingHorizontal: 4,
                            borderRadius: 50,
                        }}
                    >
                        <Pressable
                            onPress={() => handleChange("dark")}
                            style={{
                                padding: 6,
                                borderRadius: 50,
                                backgroundColor:
                                    value === "dark"
                                        ? withAlpha(colors.text.primary, 0.4)
                                        : "transparent",
                            }}
                        >
                            <Moon size={18} fill={colors.text.primary} />
                        </Pressable>

                        <Pressable
                            style={{
                                padding: 6,
                                borderRadius: 50,
                                backgroundColor:
                                    value === "system"
                                        ? withAlpha(colors.text.primary, 0.4)
                                        : "transparent",
                            }}
                            onPress={() => handleChange("system")}
                        >
                            <Text preset="label2">Auto</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => handleChange("light")}
                            style={{
                                padding: 6,
                                borderRadius: 50,
                                backgroundColor:
                                    value === "light"
                                        ? withAlpha(colors.text.primary, 0.4)
                                        : "transparent",
                            }}
                        >
                            <Sun
                                size={21}

                                fill={colors.text.primary}
                            />
                        </Pressable>
                    </View>
                ),
            },
            {
                label: "Jouer les animations",
                icon: (
                    <Lightning
                        stroke={colors.text.primary}
                        size={18}
                        opacity={0.6}
                    />
                ),
                children: (
                    <Switch
                        value={tempState}
                        onValueChange={(toSet) => setTempStateValue(toSet)}
                    />
                ),
            },
            {
                label: "Retours haptiques",
                icon: (
                    <Vibrate stroke={colors.text.primary} size={18} opacity={0.6} />
                ),
                children: (
                    <Switch
                        value={hapticsEnabled}
                        onValueChange={(toSet) => setHapticsEnabled(toSet)}
                    />
                ),
            },
        ],
        [hapticsEnabled, tempState, colors, value]
    );

    return (
        <SettingSectionLayout label={label}>
            <View style={{ gap: 2 }}>
                {themeSettings.map(({ children, icon, label }, index) => (
                    <Section
                        key={index}
                        label={label}
                        icon={icon}
                        disabled
                        index={index}
                        totalLength={themeSettings.length}
                    >
                        {children}
                    </Section>
                ))}
            </View>
        </SettingSectionLayout>
    );
}
