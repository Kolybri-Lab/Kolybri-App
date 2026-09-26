const APP_ENV = process.env.APP_ENV || process.env.EAS_BUILD_PROFILE || "production";

const IS_DEV = APP_ENV === "development" || APP_ENV === "dev" || APP_ENV === "build";
const IS_PREVIEW = APP_ENV === "preview";

const getAppName = () => {
    if (IS_DEV) return "Kolybri (Dev)";
    if (IS_PREVIEW) return "Kolybri (Preview)";
    return "Kolybri";
};

const getUniqueIdentifier = () => {
    if (IS_DEV) {
        return {
            android: "org.kolybri.app.dev",
            ios: "com.as2pick.EcoleDirectePlusMobileEPO.dev",
        };
    }
    if (IS_PREVIEW) {
        return {
            android: "org.kolybri.app.preview",
            ios: "com.as2pick.EcoleDirectePlusMobileEPO.preview",
        };
    }
    return {
        android: "org.kolybri.app",
        ios: "com.as2pick.EcoleDirectePlusMobileEPO",
    };
};

const getScheme = () => {
    if (IS_DEV) return "kolybri-dev";
    if (IS_PREVIEW) return "kolybri-preview";
    return "kolybri";
};

const identifiers = getUniqueIdentifier();

export default {
    name: getAppName(),
    slug: "kolybri",
    extra: {
        eas: {
            projectId: "597e7932-e1c1-4c19-a8b9-5b77ea8659f2",
        },
    },
    scheme: getScheme(),
    plugins: [
        "expo-dev-client",
        "expo-secure-store",
        "expo-font",
        "expo-splash-screen",
        "@react-native-community/datetimepicker",
        [
            "expo-build-properties",
            {
                android: {
                    enableProguardInReleaseBuilds: true,
                    enableShrinkResourcesInReleaseBuilds: true,
                    extraProguardRules:
                        "-keep class com.facebook.hermes.unicode.** { *; }",
                    enable16KbPageSizes: true,
                    enableMinifyInReleaseBuilds: true,
                },
            },
        ],
    ],
    updates: {
        url: "https://u.expo.dev/597e7932-e1c1-4c19-a8b9-5b77ea8659f2",
    },
    runtimeVersion: {
        policy: "appVersion",
    },

    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    platforms: ["android", "ios"],
    splash: {
        image: "./assets/icons/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#181829",
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: identifiers.ios,
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
        },
    },
    android: {
        package: identifiers.android,
        playStoreUrl:
            "https://play.google.com/store/apps/details?id=org.kolybri.app",
        adaptiveIcon: {
            foregroundImage: "./assets/icons/colored-icon.png",
            monochromeImage: "./assets/icons/monochromatic-icon.png",
            backgroundColor: "#181829",
            predictiveBackGestureEnabled: true,
        },
    },
    owner: "kolybrilab",
    githubUrl: "https://github.com/Kolybri-Lab/Kolybri-App",
};

