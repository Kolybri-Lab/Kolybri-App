import createScreen from "@/router/helpers/createScreen";
import ContributorsScreen from "@/screens/Client/Settings/about/Contributors";
import PlusScreen from "@/screens/Client/Settings/about/Plus";
import AboutScreen from "@/screens/Client/Settings/AboutSetting";
import AccountScreen from "@/screens/Client/Settings/AccountSetting";
import DataAndConfidentialityScreen from "@/screens/Client/Settings/DataAndConfidentialitySetting";
import FeedbackScreen from "@/screens/Client/Settings/FeedbackSetting";
import ReleaseInfosScreen from "@/screens/Client/Settings/ReleaseNotesSetting";
import SettingsScreen from "@/screens/Client/Settings/SettingsScreen";
import ThemeScreen from "@/screens/Client/Settings/ThemeSetting";
import { routesNames } from "../../../config/routesNames";

const {
    settings: {
        home,
        account_settings: { account, data_and_confidentiality },
        app_settings: { theme },
        about_settings: { release_notes, about, contributors, plus, feedback },
    },
} = routesNames;

const settingsClientScreen = [
    createScreen(home, SettingsScreen),
    createScreen(account, AccountScreen),
    createScreen(data_and_confidentiality, DataAndConfidentialityScreen),
    createScreen(theme, ThemeScreen),
    createScreen(release_notes, ReleaseInfosScreen),
    createScreen(feedback, FeedbackScreen),
    createScreen(about, AboutScreen),
    createScreen(contributors, ContributorsScreen),
    createScreen(plus, PlusScreen),
];

export default settingsClientScreen;
