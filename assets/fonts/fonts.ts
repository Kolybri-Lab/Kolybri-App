const baloo2 = {
    Regular: require("./Baloo2/Baloo2-Regular.ttf"),
    Medium: require("./Baloo2/Baloo2-Medium.ttf"),
    SemiBold: require("./Baloo2/Baloo2-SemiBold.ttf"),
    Bold: require("./Baloo2/Baloo2-Bold.ttf"),
    ExtraBold: require("./Baloo2/Baloo2-ExtraBold.ttf"),
};

const petrona = {
    "Petrona-Regular": require("./Petrona/Petrona-Regular.ttf"),
    "Petrona-Medium": require("./Petrona/Petrona-Medium.ttf"),
    "Petrona-SemiBold": require("./Petrona/Petrona-SemiBold.ttf"),
    "Petrona-Bold": require("./Petrona/Petrona-Bold.ttf"),
    "Petrona-ExtraBold": require("./Petrona/Petrona-ExtraBold.ttf"),
};

const luciole = {
    "Luciole-Regular": require("./Luciole/Luciole-Regular.ttf"),
};

export const fonts = { ...baloo2, ...petrona, ...luciole };
