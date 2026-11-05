import { GradeProvider } from "@/features/grades/context/GradeContext";
import { routesNames } from "@/router/config/routesNames";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GradeDetails from "./GradeDetails";
import GradesContent from "./GradesContent";
const NativeStack = createNativeStackNavigator();

export default function GradesScreen() {
    const {
        client: {
            grades: { content, details },
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
                <NativeStack.Screen name={content} component={GradesContent} />
                <NativeStack.Screen name={details} component={GradeDetails} />
            </NativeStack.Navigator>
        </GradeProvider>
    );
}

