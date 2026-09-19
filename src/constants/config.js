import dayjs from "dayjs";

export const CONFIG = {
    tabBarHeight: 87,
    upper: 26,
    dateNow: dayjs().format("YYYY-MM-DD"),
    preciseDateNow: dayjs().format("YYYY-MM-DD_HH:mm"),
    minCourseSize: 10, // %,
    middleNoonCourseTime: 48600000, // ms
    discordInviteLink: "https://discord.gg/AKAqXfTgvE",
    localSecretKeyStoreName: "appnameversion",
    totalTokenExpirationTime: 1200, // sec
};

export const GUEST_CREDENTIALS = {
    username: "guest",
    password: "guestauth",
};
export const WEBHOOK_URL = process.env.EXPO_PUBLIC_WEBHOOK_URL ?? "";
