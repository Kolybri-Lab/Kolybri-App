import {
    GradesIcon,
    HomeIcon,
    HomeworksIcon,
    MessagingIcon,
    TimetableIcon,
} from "@/components/svg/navigation";
import createScreen from "@/router/helpers/createScreen";
import GradesScreen from "@/screens/Client/Grades/GradesScreen";
import HomeScreen from "@/screens/Client/Home/HomeScreen";
import HomeworksScreen from "@/screens/Client/Homeworks/HomeworksScreen";
import MessagingScreen from "@/screens/Client/Messaging/MessagingScreen";
import TimetableScreen from "@/screens/Client/Timetable/TimetableScreen";
import { routesNames } from "../../../config/routesNames";

const {
    client: { grades, home, homeworks, messaging, timetable },
} = routesNames;

const tabClientScreens = [
    createScreen(grades.group, GradesScreen, {
        inNavbar: true,
        icon: GradesIcon,
    }),
    createScreen(homeworks.group, HomeworksScreen, {
        inNavbar: true,
        icon: HomeworksIcon,
    }),
    createScreen(home, HomeScreen, {
        inNavbar: true,
        icon: HomeIcon,
    }),
    createScreen(timetable.group, TimetableScreen, {
        inNavbar: true,
        icon: TimetableIcon,
    }),
    createScreen(messaging.group, MessagingScreen, {
        inNavbar: true,
        icon: MessagingIcon,
    }),
];

export default tabClientScreens;
