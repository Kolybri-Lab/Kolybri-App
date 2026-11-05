import { WEBHOOK_URL } from "@/constants/config";
import { useErrorStore } from "@/hooks/useErrorStore";
import { ReportOptions } from "@/types/feedback";
import { logger } from "@/utils/logger";
import { fetch } from "expo/fetch";

let lastSentTimestamp = 0;
const RATE_LIMIT_DELAY_MS = 1000 * 60 * 5; // 5min

const TECH_FIELD_LABELS: Record<string, string> = {
    appVersion: "📦 Version de l'app",
    modelInfo: "📱 Modèle",
    osInfo: "⚙️ Système",
    screenInfo: "🖥️ Écran",
    theme: "🎨 Thème",
};

export const sendDevReport = async ({
    form,
    type = "feedback",
}: ReportOptions): Promise<{ success: boolean; message?: string }> => {
    // Anti-spam
    const now = Date.now();
    if (now - lastSentTimestamp < RATE_LIMIT_DELAY_MS) {
        const remainingMs = RATE_LIMIT_DELAY_MS - (now - lastSentTimestamp);

        const totalSeconds = Math.ceil(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const time = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        return {
            success: false,
            message: `Veuillez patienter ${time} avant d'envoyer un autre rapport.`,
        };
    }

    const errors = useErrorStore.getState().errors;
    let formattedError = "Aucune erreur";
    if (errors.length > 0) {
        formattedError = errors
            .map((item, index) => {
                const err = item.error;
                const time = new Date(item.timestamp).toLocaleTimeString("fr-FR");
                let extra = "";
                if (err.type === "api-business") {
                    extra = ` (Code: ${err.code}${err.feature ? `, Module: ${err.feature}` : ""})`;
                } else if (err.type === "auth") {
                    extra = ` (Raison: ${err.reason}, Code: ${err.code})`;
                }
                return `**${index + 1}. [${err.type.toUpperCase()}]** - ${time}${extra}\n\`\`\`\n${err.message.slice(0, 300)}\n\`\`\``;
            })
            .join("\n")
            .slice(0, 1000);
    }

    const payload = {
        username: "Feedback Service",
        avatar_url:
            "https://people.com/thmb/ikAfqWriYr0hk_e1UcST5TfWLeI=/4000x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(749x0:751x2)/peggy-the-dog-Deadpool--Wolverine-world-premiere--205-07222024-3b178eb773654f1b9934c982ebd951b7.jpg", // avatar custom
        embeds: [
            {
                title:
                    type === "error"
                        ? "🚨 Erreur / Crash signalé"
                        : "💬 Retour utilisateur",
                description: `
                ## 📢 Titre: "${form.title}"
                ### Catégorie: *${form.category}*\n`,
                color: type === "error" ? 0xe74c3c : 0x7c83eb,
                fields: [
                    {
                        name: "📝 Message",
                        value: `\`\`\`${form.message}\`\`\``,
                        inline: true,
                    },

                    ...Object.entries(form.tech).map(([key, value]) => ({
                        name: TECH_FIELD_LABELS[key] ?? key,
                        value: String(value),
                        inline: false,
                    })),
                    ...(type === "error"
                        ? [
                              {
                                  name: "⚠️ Détails de l'erreur",
                                  value: `\`\`\`\n${formattedError}\n\`\`\``, // bloc of code
                                  inline: false,
                              },
                          ]
                        : []),
                ],

                timestamp: new Date().toISOString(),
            },
        ],
    };

    try {
        logger.log("[FETCH] POST Discord Webhook");
        const res = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            lastSentTimestamp = now;
            return { success: true };
        }

        return {
            success: false,
            message: `Erreur serveur Discord (${res.status})`,
        };
    } catch (err: any) {
        return {
            success: false,
            message: err?.message ?? "Erreur réseau inconnue",
        };
    }
};

