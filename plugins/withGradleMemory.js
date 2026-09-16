const { withGradleProperties } = require("@expo/config-plugins");

module.exports = function withGradleMemory(config) {
    return withGradleProperties(config, (config) => {
        const properties = config.modResults;

        const setProperty = (key, value) => {
            const existing = properties.find(
                (p) => p.type === "property" && p.key === key
            );
            if (existing) {
                existing.value = value;
            } else {
                properties.push({ type: "property", key, value });
            }
        };

        setProperty("org.gradle.jvmargs", "-Xmx3072m -XX:MaxMetaspaceSize=1024m");
        setProperty("org.gradle.workers.max", "3");

        return config;
    });
};
