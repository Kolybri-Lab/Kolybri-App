import mapScreens from "@/router/helpers/mapScreens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { routesNames } from "../../../config/routesNames";
import settingsClientScreen from "./indexClientSettings";

const Stack = createNativeStackNavigator();

export default function Settings() {
    const screens = mapScreens({
        navMethod: Stack,
        screenArray: settingsClientScreen,
    });

    return (
        <Stack.Navigator
            initialRouteName={routesNames.settings.home}
            screenOptions={{ animation: "slide_from_bottom" }}
        >
            {screens}
        </Stack.Navigator>
    );
}
