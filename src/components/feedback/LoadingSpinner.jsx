import { useTheme } from "@/hooks/useThemeStore";
import AnimatedLottie from "../display/AnimatedLottie";

const LoadingSpinner = ({ size }) => {
    const { colors } = useTheme();
    return (
        <AnimatedLottie
            autoPlay
            source={require("assets/lottie/loader.json")}
            loop
            speed={1.5}
            style={{
                width: size,
                height: size,
            }}
        />
    );
};

export default LoadingSpinner;
