import { useTheme } from "@/hooks/useThemeStore";
import LottieView from "lottie-react-native";

const LoadingSpinner = ({ size }) => {
    const { colors } = useTheme();
    return (
        <LottieView
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

