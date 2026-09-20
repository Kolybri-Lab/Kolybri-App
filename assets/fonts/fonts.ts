const baloo2 = {
    Regular: require("./Baloo2/Baloo2-Regular.ttf"),
    Medium: require("./Baloo2/Baloo2-Medium.ttf"),
    SemiBold: require("./Baloo2/Baloo2-SemiBold.ttf"),
    ExtraBold: require("./Baloo2/Baloo2-ExtraBold.ttf"),
    Bold: require("./Baloo2/Baloo2-Bold.ttf"),
};
const lexend = {
    "Lexend-Regular": require("./Lexend/Lexend-Regular.ttf"),
    "Lexend-Medium": require("./Lexend/Lexend-Medium.ttf"),
    "Lexend-Bold": require("./Lexend/Lexend-Bold.ttf"),
    "Lexend-Light": require("./Lexend/Lexend-Light.ttf"),
};
const petrona = {
    "Petrona-Regular": require("./Petrona/Petrona-Regular.ttf"),
    "Petrona-Medium": require("./Petrona/Petrona-Medium.ttf"),
    "Petrona-SemiBold": require("./Petrona/Petrona-SemiBold.ttf"),
    "Petrona-ExtraBold": require("./Petrona/Petrona-ExtraBold.ttf"),
    "Petrona-Bold": require("./Petrona/Petrona-Bold.ttf"),
};

export const fonts = { ...baloo2, ...lexend, ...petrona };

