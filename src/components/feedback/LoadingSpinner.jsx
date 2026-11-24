import { LoaderLottie } from "../lottie";

const LoadingSpinner = ({ size, color }) => {
    return (
        <LoaderLottie
            autoPlay
            loop
            speed={1.5}
            color={color}
            style={{
                width: size,
                height: size,
            }}
        />
    );
};

export default LoadingSpinner;
