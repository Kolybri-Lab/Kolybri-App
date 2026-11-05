import { GradeProvider } from "@/features/grades/context/GradeContext";
import { routesNames } from "@/router/config/routesNames";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MessagingContent from "./MessagingContent";
import MessagingDetails from "./MessagingDetails";
const NativeStack = createNativeStackNavigator();
export default function MessagingScreen({}) {
    const {
        client: {
            messaging: { content, details },
        },
    } = routesNames;

    return (
        <GradeProvider>
            <NativeStack.Navigator
                initialRouteName={content}
                screenOptions={{
                    headerShown: false,
                    animation: "fade",
                }}
            >
                <NativeStack.Screen name={content} component={MessagingContent} />
                <NativeStack.Screen name={details} component={MessagingDetails} />
            </NativeStack.Navigator>
        </GradeProvider>
    );
}
