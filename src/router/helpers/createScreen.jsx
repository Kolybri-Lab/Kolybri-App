import { useTheme } from "@/hooks/useThemeStore";

const createScreen = (screenName, ScreenComponent, options = {}, props = {}) => {
    const ScreenWrapper = (screenProps) => {
        const theme = useTheme();
        return <ScreenComponent {...screenProps} {...props} theme={theme} />;
    };

    return {
        screenName: screenName,
        screenComponent: ScreenWrapper,
        options,
    };
};

export default createScreen;

