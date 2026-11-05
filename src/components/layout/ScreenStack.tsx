import { View, type ViewProps } from "react-native";

type ScreenProps = ViewProps & {
    horizontalSpacing: number;
    children: React.ReactNode;
};

export default function ScreenStack({
    horizontalSpacing,
    children,
    ...props
}: ScreenProps) {
    return (
        <View
            {...props}
            style={[{ flex: 1, paddingHorizontal: horizontalSpacing }, props.style]}
        >
            {children}
        </View>
    );
}
