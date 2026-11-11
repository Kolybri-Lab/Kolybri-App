import { Section, Switch, Text } from "@/components";
import { Lightning, Moon, Sun } from "@/components/svg";
import { useTheme, useThemeStore } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { Vibrate } from "lucide-react-native";
import { memo, useCallback } from "react";
import { Pressable, View } from "react-native";
import SettingSectionLayout from "./components/SettingSectionLayout";

export default function ThemeScreen({ route }) {
    const label = route?.params?.label || "Thème";

    const hapticsEnabled = useThemeStore((state) => state.hapticsEnabled);
    const setHapticsEnabled = useThemeStore((state) => state.setHapticsEnabled);
    const animationsEnabled = useThemeStore((state) => state.animationsEnabled);
    const setAnimationsEnabled = useThemeStore(
        (state) => state.setAnimationsEnabled
    );
    const { colors } = useTheme();

    const themeSettings = [
        {
            label: "Thème",
            icon: <Sun fill={colors.text.primary} size={18} opacity={0.6} />,
            children: <ThemeSelector />,
        },
        {
            label: "Jouer les animations",
            icon: <Lightning stroke={colors.text.primary} size={18} opacity={0.6} />,
            children: (
                <Switch
                    value={animationsEnabled}
                    onValueChange={setAnimationsEnabled}
                />
            ),
        },
        {
            label: "Retours haptiques",
            icon: <Vibrate stroke={colors.text.primary} size={18} opacity={0.8} />,
            children: (
                <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
            ),
        },
    ];

    return (
        <SettingSectionLayout label={label}>
            <View style={{ gap: 2 }}>
                {themeSettings.map(({ children, icon, label }, index) => (
                    <Section
                        key={label}
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

const THEME_OPTIONS = [
    { id: "dark", Icon: Moon, size: 18 },
    { id: "system", label: "Auto" },
    { id: "light", Icon: Sun, size: 21 },
];

const ThemeSelector = memo(function ThemeSelector() {
    const { colors } = useTheme();

    const value = useThemeStore((state) =>
        state.followSystem ? "system" : state.themeMode
    );
    const setThemeMode = useThemeStore((state) => state.setThemeMode);
    const setFollowSystem = useThemeStore((state) => state.setFollowSystem);

    const handleSelect = useCallback(
        (id) => {
            if (id === "system") {
                setFollowSystem(true);
            } else {
                setFollowSystem(false);
                setThemeMode(id);
            }
        },
        [setFollowSystem, setThemeMode]
    );

    const activeBackground = withAlpha(colors.brand.primary, 0.5);

    return (
        <View
            style={{
                borderColor: withAlpha(colors.text.primary, 0.3),
                alignItems: "center",
                flexDirection: "row",
                gap: 16,
                borderWidth: 1,
                paddingVertical: 2,
                paddingHorizontal: 4,
                borderRadius: 50,
            }}
        >
            {THEME_OPTIONS.map((option) => (
                <ThemeOption
                    key={option.id}
                    {...option}
                    selected={value === option.id}
                    onSelect={handleSelect}
                    activeBackground={activeBackground}
                    activeColor={colors.text.onBrand}
                    idleColor={colors.text.primary}
                />
            ))}
        </View>
    );
});

const ThemeOption = memo(function ThemeOption({
    id,
    label,
    Icon,
    size,
    selected,
    onSelect,
    activeBackground,
    activeColor,
    idleColor,
}) {
    const handlePress = useCallback(() => onSelect(id), [onSelect, id]);

    return (
        <Pressable
            onPress={handlePress}
            style={[
                {
                    padding: 6,
                    borderRadius: 50,
                },
                selected && { backgroundColor: activeBackground },
            ]}
        >
            {Icon ? (
                <Icon size={size} fill={selected ? activeColor : idleColor} />
            ) : (
                <Text preset="label2">{label}</Text>
            )}
        </Pressable>
    );
});
