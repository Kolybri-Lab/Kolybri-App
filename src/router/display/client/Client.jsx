import mapScreens from "@/router/helpers/mapScreens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import appNavigatorOrganisation from "./indexClient";

import WhatsNewModal from "@/components/modal/WhatsNewModal";
import { useWhatsNew } from "@/hooks/useWhatsNew";

const Stack = createNativeStackNavigator();

export default function Client() {
    const screens = mapScreens({
        navMethod: Stack,
        screenArray: appNavigatorOrganisation,
    });

    const { item: whatsNewItem, dismiss: dismissWhatsNew } = useWhatsNew();

    return (
        <>
            <Stack.Navigator
                screenOptions={{ headerShown: false, animation: "fade" }}
            >
                {screens}
            </Stack.Navigator>

            <WhatsNewModal item={whatsNewItem} dismiss={dismissWhatsNew} />
        </>
    );
}

