import mapScreens from "@/router/helpers/mapScreens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";

import { SharePopup } from "@/components";
import { shouldShowSharePrompt, useUserStore } from "@/hooks/useUserStore";
import appNavigatorOrganisation from "./indexClient";

import WhatsNewModal from "@/components/modal/WhatsNewModal";
import { useWhatsNew } from "@/hooks/useWhatsNew";

const Stack = createNativeStackNavigator();

export default function Client() {
    const screens = mapScreens({
        navMethod: Stack,
        screenArray: appNavigatorOrganisation,
    });

    const hasHydrated = useUserStore((s) => s.hasHydrated);
    const sharePrompt = useUserStore((s) => s.sharePrompt);
    const incrementSession = useUserStore((s) => s.incrementSession);
    const markSharePromptShown = useUserStore((s) => s.markSharePromptShown);
    const markShared = useUserStore((s) => s.markShared);

    const { item: whatsNewItem, dismiss: dismissWhatsNew, settled } = useWhatsNew();

    const [showSharePopup, setShowSharePopup] = useState(false);
    const hasIncremented = useRef(false);

    // La SharePopup n'a le droit de passer que si WhatsNew a fini et n'a rien à montrer
    const canShowShare = settled && !whatsNewItem;
    useEffect(() => {
        if (hasHydrated && !hasIncremented.current) {
            hasIncremented.current = true;
            incrementSession();
        }
    }, [hasHydrated]);

    useEffect(() => {
        if (hasHydrated && canShowShare && shouldShowSharePrompt(sharePrompt)) {
            const timer = setTimeout(() => {
                setShowSharePopup(true);
                markSharePromptShown();
            }, 2000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasHydrated, canShowShare]);

    return (
        <>
            <Stack.Navigator
                screenOptions={{ headerShown: false, animation: "fade" }}
            >
                {screens}
            </Stack.Navigator>

            <WhatsNewModal item={whatsNewItem} dismiss={dismissWhatsNew} />

            <SharePopup
                visible={showSharePopup}
                onClose={() => setShowSharePopup(false)}
                onShared={() => {
                    markShared();
                    setShowSharePopup(false);
                }}
            />
        </>
    );
}

