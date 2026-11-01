// TimetableScreen.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { routesNames } from "@/router/config/routesNames";
import TimetableContent from "./TimetableContent";

const Stack = createNativeStackNavigator();

export default function TimetableScreen() {
    const {
        client: {
            timetable: { content },
        },
    } = routesNames;

    return (
        <Stack.Navigator
            initialRouteName={content}
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen
                name={content}
                component={TimetableContent}
                options={{ gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
}

