import { Section, Switch, Text } from "@/components";
import { Lightning, Moon, Sun } from "@/components/svg";
import { useTheme, useThemeStore } from "@/hooks/useThemeStore";
import { Vibrate } from "lucide-react-native";
import { useState } from "react";
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

    return (
        <SettingSectionLayout label={label}>
            <View style={{ gap: 2 }}>
                <Section
                    label={"Thème"}
                    icon={<Sun fill={colors.text.primary} size={18} opacity={0.6} />}
                    index={0}
                    totalLength={3}
                >
                    <View
                        style={{
                            alignItems: "center",
                            flexDirection: "row",
                            gap: 16,
                            borderColor: "hsla(0, 0%, 100%, .3)",
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
                                        ? "hsla(0, 0%, 100%, .4)"
                                        : "transparent",
                            }}
                        >
                            <Moon size={18} />
                        </Pressable>

                        <Pressable
                            style={{
                                padding: 6,
                                borderRadius: 50,
                                backgroundColor:
                                    value === "system"
                                        ? "hsla(0, 0%, 100%, .4)"
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
                                        ? "hsla(0, 0%, 100%, .4)"
                                        : "transparent",
                            }}
                        >
                            <Sun size={21} opacity={1} />
                        </Pressable>
                    </View>
                </Section>
                <Section
                    label={"Jouer les animations"}
                    icon={
                        <Lightning
                            stroke={colors.text.primary}
                            size={18}
                            opacity={0.6}
                        />
                    }
                    index={1}
                    totalLength={3}
                >
                    <Switch
                        value={tempState}
                        onValueChange={(toSet) => setTempStateValue(toSet)}
                    />
                </Section>
                <Section
                    label={"Retours haptiques"}
                    icon={
                        <Vibrate
                            stroke={colors.text.primary}
                            size={18}
                            opacity={0.6}
                        />
                    }
                    index={2}
                    totalLength={3}
                >
                    <Switch
                        value={hapticsEnabled}
                        onValueChange={(toSet) => setHapticsEnabled(toSet)}
                    />
                </Section>
            </View>

            <Text
                style={{ marginTop: 20 }}
                color="hsla(0, 0%, 100%, .85)"
                preset="label1"
                align="center"
            >
                Ça arrive bientôt !
            </Text>
        </SettingSectionLayout>
    );
}
