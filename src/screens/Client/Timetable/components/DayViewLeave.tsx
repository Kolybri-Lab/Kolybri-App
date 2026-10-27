import LottieView from "lottie-react-native";
import { memo, useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import FreeAnimation from "assets/lottie/00_anim_free_tier3_1.json";

interface DayViewLeaveProps {
    isActive: boolean;
    shouldAnimate?: boolean;
}

function DayViewLeaveComponent({
    isActive,
    shouldAnimate = true,
}: DayViewLeaveProps) {
    const animRef = useRef<LottieView>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (!isActive) {
            hasStartedRef.current = false;
            return;
        }

        if (isActive && shouldAnimate && !hasStartedRef.current) {
            hasStartedRef.current = true;
            animRef.current?.reset();
            animRef.current?.play(6, 60);
        }
    }, [isActive, shouldAnimate]);

    const handlePress = () => {
        animRef.current?.play(10, 60);
    };

    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
                paddingBottom: 40,
            }}
        >
            <Pressable
                onPress={handlePress}
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                <LottieView
                    ref={animRef}
                    source={FreeAnimation}
                    loop={false}
                    progress={!shouldAnimate && !hasStartedRef.current ? 1 : undefined}
                    speed={1.35}
                    style={{
                        width: 280,
                        height: 280,
                    }}
                />
            </Pressable>
            <View style={{ height: "20%" }} />
        </View>
    );
}

export const DayViewLeave = memo(DayViewLeaveComponent);

