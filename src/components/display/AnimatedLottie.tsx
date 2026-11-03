// components/AnimatedLottie.tsx
import { useThemeStore } from "@/hooks/useThemeStore";
import LottieView, { type LottieViewProps } from "lottie-react-native";
import { forwardRef, useImperativeHandle, useRef } from "react";

export type AnimatedLottieProps = LottieViewProps;

export type AnimatedLottieHandle = Pick<
    LottieView,
    "play" | "resume" | "pause" | "reset"
>;

const AnimatedLottie = forwardRef<AnimatedLottieHandle, AnimatedLottieProps>(
    function AnimatedLottie({ autoPlay, loop, progress, ...rest }, ref) {
        const animationsEnabled = useThemeStore((state) => state.animationsEnabled);
        const innerRef = useRef<LottieView>(null);

        useImperativeHandle(
            ref,
            () => ({
                play: (startFrame?: number, endFrame?: number) => {
                    if (animationsEnabled) {
                        innerRef.current?.play(startFrame, endFrame);
                    }
                },
                resume: () => {
                    if (animationsEnabled) innerRef.current?.resume();
                },
                pause: () => innerRef.current?.pause(),
                reset: () => {
                    if (animationsEnabled) innerRef.current?.reset();
                },
            }),
            [animationsEnabled]
        );

        const animationProps: Partial<LottieViewProps> = animationsEnabled
            ? { autoPlay, loop, progress }
            : { autoPlay: false, loop: false, progress: 1 };

        return <LottieView ref={innerRef} {...rest} {...animationProps} />;
    }
);

export default AnimatedLottie;
