import { useTheme } from "@/hooks/useThemeStore";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function Modal({ children, visible, handleClose }) {
    const [isRendered, setIsRendered] = useState(false);
    const translateY = useSharedValue(500);
    const opacity = useSharedValue(0);

    const { colors } = useTheme();

    useEffect(() => {
        if (visible) {
            setIsRendered(true);
            translateY.value = withTiming(0, { duration: 450 });
            opacity.value = withTiming(1, { duration: 250 });
        } else {
            translateY.value = withTiming(500, { duration: 350 }, () => {
                scheduleOnRN(setIsRendered, false);
            });
            opacity.value = withTiming(0, { duration: 250 });
        }
    }, [visible]);

    const modalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!isRendered) return null;

    return (
        <View
            // pointerEvents="box-none"
            style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: 1000,
            }}
        >
            {/* Backdrop */}
            <Animated.View
                style={[
                    {
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.7)",
                    },
                    backdropStyle,
                ]}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleClose}
                    style={{ flex: 1 }}
                />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        backgroundColor: colors.surface.raised,
                        borderTopLeftRadius: 42,
                        borderTopRightRadius: 42,
                        paddingHorizontal: 24,
                        paddingTop: 16,
                        paddingBottom: 40,
                        minHeight: (1 / 3) * 100 + "%", // 1/3 of the screen
                        maxHeight: (4 / 6) * 100 + "%",
                    },
                    modalStyle,
                ]}
            >
                {/* Drag handle */}
                <View
                    style={{
                        width: 50,
                        height: 5,
                        backgroundColor: colors.surface.default,
                        borderRadius: 3,
                        alignSelf: "center",
                        marginBottom: 24,
                    }}
                />

                {/* Content area — vide */}
                {children}
            </Animated.View>
        </View>
    );
}
