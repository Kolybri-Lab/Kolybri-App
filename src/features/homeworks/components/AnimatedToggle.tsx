import { useCallback, useEffect, useRef, useState } from "react";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";

import { AnimatedLottie } from "@/components";
import FailAnimation from "../../../../assets/lottie/Fail.json";
import Loading1Animation from "../../../../assets/lottie/Loading1.json";
import Loading2Animation from "../../../../assets/lottie/Loading2.json";
import SuccessAnimation from "../../../../assets/lottie/Success.json";

export interface AnimatedToggleProps {
    isDone?: "done" | "todo" | boolean;
    loadingState?: "idle" | "loading" | "error";
    onToggle?: () => void;
    onPress?: () => void;
    size?: number;
    speed?: number;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

type AnimationStep =
    | "static_loading1"
    | "static_success"
    | "static_fail"
    | "loading1_forward"
    | "loading2_forward"
    | "unwind_icon"
    | "loading2_reverse"
    | "loading1_reverse"
    | "target_icon";

export default function AnimatedToggle({
    isDone = "todo",
    loadingState = "idle",
    onToggle,
    onPress,
    size = 40,
    speed = 2,
    disabled = false,
    style,
}: AnimatedToggleProps) {
    const isCompleted = isDone === "done" || isDone === true;

    const previousIconRef = useRef<"loading1" | "success" | "fail">(
        isCompleted ? "success" : "loading1"
    );

    const [currentStep, setCurrentStep] = useState<AnimationStep>(() => {
        if (loadingState === "loading") {
            return isCompleted ? "unwind_icon" : "loading1_forward";
        }
        if (loadingState === "error") return "static_fail";
        return isCompleted ? "static_success" : "static_loading1";
    });

    const [isPlaying, setIsPlaying] = useState<boolean>(() => {
        return loadingState === "loading";
    });

    const [cycle, setCycle] = useState<number>(0);

    const loadingStateRef = useRef(loadingState);
    loadingStateRef.current = loadingState;

    const isCompletedRef = useRef(isCompleted);
    isCompletedRef.current = isCompleted;

    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;

    const currentStepRef = useRef(currentStep);
    currentStepRef.current = currentStep;

    const isFirstMount = useRef(true);
    const prevIsCompletedRef = useRef(isCompleted);
    const prevLoadingStateRef = useRef(loadingState);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            prevIsCompletedRef.current = isCompleted;
            prevLoadingStateRef.current = loadingState;
            return;
        }

        const prevIsCompleted = prevIsCompletedRef.current;
        const prevLoading = prevLoadingStateRef.current;
        prevIsCompletedRef.current = isCompleted;
        prevLoadingStateRef.current = loadingState;

        // If an animation is already in progress, the state machine will handle transitions on completion
        if (isPlayingRef.current) {
            return;
        }

        // If loading started externally
        if (loadingState === "loading" && prevLoading !== "loading") {
            setIsPlaying(true);
            setCycle((c) => c + 1);
            if (previousIconRef.current === "loading1") {
                setCurrentStep("loading1_forward");
            } else {
                setCurrentStep("unwind_icon");
            }
        }
        // If completion changed externally while idle
        else if (isCompleted !== prevIsCompleted) {
            setIsPlaying(true);
            setCycle((c) => c + 1);
            if (isCompleted) {
                setCurrentStep("loading1_forward");
            } else {
                setCurrentStep("unwind_icon");
            }
        }
        // If error occurred externally while idle
        else if (loadingState === "error" && prevLoading !== "error") {
            setIsPlaying(true);
            setCycle((c) => c + 1);
            setCurrentStep("target_icon");
        }
    }, [loadingState, isCompleted]);

    const handlePress = () => {
        if (disabled || isPlaying || loadingState === "loading") return;

        setIsPlaying(true);
        setCycle((c) => c + 1);

        if (previousIconRef.current === "loading1") {
            setCurrentStep("loading1_forward");
        } else {
            setCurrentStep("unwind_icon");
        }

        const callback = onToggle ?? onPress;
        callback?.();
    };

    const handleAnimationFinish = useCallback((isCancelled?: boolean) => {
        if (isCancelled) return;

        const step = currentStepRef.current;
        const currentLoading = loadingStateRef.current;
        const currentCompleted = isCompletedRef.current;

        // --- FORWARD FLOW (started from static_loading1) ---
        if (step === "loading1_forward") {
            if (currentLoading === "loading") {
                setCurrentStep("loading2_forward");
                setCycle((c) => c + 1);
            } else {
                // Loading is idle or finished -> play target icon (Success / Fail)
                setCurrentStep("target_icon");
                setCycle((c) => c + 1);
            }
        } else if (step === "loading2_forward") {
            if (currentLoading === "loading") {
                setCycle((c) => c + 1);
            } else {
                setCurrentStep("target_icon");
                setCycle((c) => c + 1);
            }
        }

        // --- REVERSE FLOW (started from static_success or static_fail) ---
        else if (step === "unwind_icon") {
            if (currentLoading === "loading") {
                setCurrentStep("loading2_reverse");
                setCycle((c) => c + 1);
            } else {
                setCurrentStep("loading1_reverse");
                setCycle((c) => c + 1);
            }
        } else if (step === "loading2_reverse") {
            if (currentLoading === "loading") {
                setCycle((c) => c + 1);
            } else {
                setCurrentStep("loading1_reverse");
                setCycle((c) => c + 1);
            }
        } else if (step === "loading1_reverse") {
            if (currentLoading === "error") {
                setCurrentStep("target_icon");
                setCycle((c) => c + 1);
            } else if (currentCompleted) {
                setCurrentStep("target_icon");
                setCycle((c) => c + 1);
            } else {
                setIsPlaying(false);
                setCurrentStep("static_loading1");
                previousIconRef.current = "loading1";
            }
        }

        // --- TARGET ICON COMPLETION ---
        else if (step === "target_icon") {
            setIsPlaying(false);
            if (currentLoading === "error") {
                setCurrentStep("static_fail");
                previousIconRef.current = "fail";
            } else if (currentCompleted) {
                setCurrentStep("static_success");
                previousIconRef.current = "success";
            } else {
                setCurrentStep("static_fail");
                previousIconRef.current = "fail";
            }
        }
    }, []);

    const getAnimConfig = () => {
        switch (currentStep) {
            case "static_loading1":
                return {
                    source: Loading1Animation,
                    speed: 1,
                };
            case "static_success":
                return {
                    source: SuccessAnimation,
                    speed: 1,
                };
            case "static_fail":
                return {
                    source: FailAnimation,
                    speed: 1,
                };
            case "loading1_forward":
                return {
                    source: Loading1Animation,
                    speed: speed,
                };
            case "loading2_forward":
                return {
                    source: Loading2Animation,
                    speed: speed,
                };
            case "unwind_icon":
                return {
                    source:
                        previousIconRef.current === "success"
                            ? SuccessAnimation
                            : FailAnimation,
                    speed: -speed,
                };
            case "loading2_reverse":
                return {
                    source: Loading2Animation,
                    speed: -speed,
                };
            case "loading1_reverse":
                return {
                    source: Loading1Animation,
                    speed: -speed,
                };
            case "target_icon":
                return {
                    source:
                        loadingStateRef.current === "error" ||
                        !isCompletedRef.current
                            ? FailAnimation
                            : SuccessAnimation,
                    speed: speed,
                };
        }
    };

    const getProgress = () => {
        if (isPlaying) return undefined;
        if (currentStep === "static_loading1") return 0;
        if (currentStep === "static_success" || currentStep === "static_fail")
            return 1;
        return undefined;
    };

    const animConfig = getAnimConfig();

    return (
        <TouchableOpacity
            style={[
                {
                    width: size,
                    height: size,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2000,
                },
                style,
            ]}
            onPress={handlePress}
            hitSlop={12}
            disabled={disabled || isPlaying || loadingState === "loading"}
            activeOpacity={0.7}
        >
            <AnimatedLottie
                key={`${currentStep}_${cycle}`}
                source={animConfig.source}
                speed={animConfig.speed}
                autoPlay={isPlaying}
                loop={false}
                progress={getProgress()}
                onAnimationFinish={handleAnimationFinish}
                style={{ width: size, height: size }}
            />
        </TouchableOpacity>
    );
}
