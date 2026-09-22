// components/CustomNavbar.js
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { memo, useCallback, useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { MorphingText } from "../core";

const ROUTES_NAMES = {
    client_grades: "Notes",
    client_homeworks: "Tâches",
    client_home: "Accueil",
    client_timetable: "Cours",
    client_messaging: "Messages",
};
const BAR_WIDTH = 36;
const SPRING_CONFIG = {
    damping: 18,
    stiffness: 150,
    mass: 1,
    overshootClamping: false,
};

const NavigationBottomBar = ({ state, descriptors, navigation }) => {
    const tabLayouts = useRef({});
    const hasMeasuredActive = useRef(false);
    const indicatorX = useSharedValue(0);
    const haptics = useHaptic("medium");
    const { colors } = useTheme();
    const animatedIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorX.value }],
    }));

    const moveIndicatorTo = useCallback(
        (index, animated = true) => {
            const layout = tabLayouts.current[index];
            if (!layout) return;
            const centeredX = layout.x + layout.width / 2 - BAR_WIDTH / 2;

            if (animated) {
                indicatorX.value = withSpring(centeredX, SPRING_CONFIG);
            } else {
                indicatorX.value = centeredX;
            }
        },
        [indicatorX]
    );

    const onTabLayout = useCallback(
        (index, event) => {
            const { x, width } = event.nativeEvent.layout;
            tabLayouts.current[index] = { x, width };

            if (index === state.index && !hasMeasuredActive.current) {
                hasMeasuredActive.current = true;
                moveIndicatorTo(index, false);
            }
        },
        [state.index, moveIndicatorTo]
    );

    const handleTabPress = useCallback(
        (routeKey, routeName, isFocused) => {
            haptics();
            const event = navigation.emit({
                type: "tabPress",
                target: routeKey,
                canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(routeName);
            }
        },
        [navigation, haptics]
    );

    useEffect(() => {
        moveIndicatorTo(state.index, true);
    }, [state.index, moveIndicatorTo]);

    return (
        <SafeAreaView
            edges={["bottom"]}
            style={{ backgroundColor: colors.tabBar.background }}
        >
            <View
                style={{
                    width: "100%",
                    height: 3,
                    backgroundColor: colors.tabBar.border,
                }}
            />
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        width: BAR_WIDTH,
                        height: 3,
                        borderRadius: 6,
                        backgroundColor: colors.tabBar.active,
                    },
                    animatedIndicatorStyle,
                ]}
            />
            <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 0.25 }} />
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    if (!options.inNavbar) return null;
                    const isFocused = state.index === index;
                    const IconComponent = options.icon;

                    return (
                        <TabButton
                            key={route.key}
                            index={index}
                            route={route}
                            options={options}
                            isFocused={isFocused}
                            onPress={handleTabPress}
                            onLayout={onTabLayout}
                            IconComponent={IconComponent}
                        />
                    );
                })}
                <View style={{ flex: 0.25 }} />
            </View>
        </SafeAreaView>
    );
};

const TabButton = memo(
    ({ index, route, options, isFocused, onPress, onLayout, IconComponent }) => {
        const BASE_ICON_SIZE = 26;
        const FOCUSED_SCALE = 1;
        const UNFOCUSED_SCALE = 1.3;

        const { colors } = useTheme();

        const iconScale = useSharedValue(
            isFocused ? FOCUSED_SCALE : UNFOCUSED_SCALE
        );
        const pressScale = useSharedValue(1);

        const haptics = useHaptic("success");

        useEffect(() => {
            iconScale.value = withSpring(
                isFocused ? FOCUSED_SCALE : UNFOCUSED_SCALE,
                {
                    damping: 100,
                    mass: 1,
                    stiffness: 145,
                }
            );
        }, [isFocused]);

        const animatedIconStyle = useAnimatedStyle(() => ({
            transform: [{ scale: iconScale.value * pressScale.value }],
        }));

        const handlePress = useCallback(() => {
            onPress(route.key, route.name, isFocused);
        }, [onPress, route.key, route.name, isFocused]);

        const handleLayout = useCallback(
            (e) => {
                onLayout(index, e);
            },
            [onLayout, index]
        );

        return (
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={handlePress}
                onPressIn={() => {
                    pressScale.value = withSpring(0.9, {
                        damping: 10,
                        stiffness: 350,
                    });
                }}
                onPressOut={() => {
                    pressScale.value = withSpring(1, {
                        damping: 100,
                        stiffness: 250,
                    });
                }}
                onLongPress={() => {
                    haptics();
                }}
                onLayout={handleLayout}
                style={{ flex: 1, alignItems: "center" }}
            >
                <View
                    style={{
                        padding: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "visible",
                    }}
                >
                    <Animated.View style={animatedIconStyle}>
                        <IconComponent
                            width={BASE_ICON_SIZE}
                            height={BASE_ICON_SIZE}
                            color={
                                isFocused
                                    ? colors.tabBar.active
                                    : colors.tabBar.inactive
                            }
                        />
                    </Animated.View>
                    <MorphingText
                        preset="label3"
                        weight={isFocused ? "bold" : "medium"}
                        color={colors.tabBar.active}
                        value={isFocused ? (ROUTES_NAMES[route.name] ?? "N/A") : ""}
                        style={{ letterSpacing: 0.8, width: "100%" }}
                    />
                </View>
            </TouchableOpacity>
        );
    }
);

export default NavigationBottomBar;
