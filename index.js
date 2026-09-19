import { registerRootComponent } from "expo";
import { initLogger } from "./src/utils/logger";
import App from "./src/App.jsx";

initLogger();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
