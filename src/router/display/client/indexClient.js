import createScreen from "@/router/helpers/createScreen";
import { routesNames } from "../../config/routesNames";
import Settings from "./settings/Settings";
import Tabs from "./tabs/Tabs";

const {
    navigators: { settings, tabs },
} = routesNames;

const appNavigatorOrganisation = [
    createScreen(tabs, Tabs), // PAY ATTENTION TO THE ORDER !
    createScreen(settings, Settings),
];

export default appNavigatorOrganisation;
