import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import mapScreens from "@/router/helpers/mapScreens";
import { NavigationBottomBar } from "../../../../components";
import { routesNames } from "../../../config/routesNames";
import tabClientScreens from "./indexClientTabs";

const Tab = createBottomTabNavigator();

const renderTabBar = (props) => <NavigationBottomBar {...props} />;

export default function Tabs() {
    const screens = mapScreens({ navMethod: Tab, screenArray: tabClientScreens });

    return (
        <Tab.Navigator
            tabBar={renderTabBar}

            initialRouteName={routesNames.client.home}
            backBehavior="initialRoute"
            screenOptions={{
                headerShown: false,
                animation: "fade",
                lazy: false,
                tabBarStyle: { backgroundColor: "transparent" },
            }}
        >
            {screens}
        </Tab.Navigator>
    );
}

