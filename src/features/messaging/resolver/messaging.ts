import fetchApi from "@/services/fetchApi";
import { FetchApiResponse } from "@/types";
import base64Handler from "@/utils/handleBase64";
import {
    ApiMessage,
    ApiMessageSender,
    ApiMessagingResponseData,
    FormattedMessage,
    MessageAttachment,
    MessageContent,
    MessageContentResolverParams,
    MessageSender,
    MessagingResolverParams,
    ResolvedMessaging,
} from "../types";

const DEFAULT_MESSAGING: ResolvedMessaging = {
    received: [],
    sent: [],
    draft: [],
    archived: [],
    folders: [],
    pagination: {
        receivedCount: 0,
        sentCount: 0,
        draftCount: 0,
        archivedCount: 0,
        unreadCount: 0,
    },
    settings: {
        isActive: false,
        canContactTeachers: false,
        canContactAdmin: false,
        canContactStudents: false,
        canContactFamilies: false,
        canContactCompanies: false,
    },
};

export default async function messagingResolver({
    token,
    page = 0,
    itemsPerPage = 20,
    typeOfRecovery = "received",
    binderId = 0,
}: MessagingResolverParams): Promise<ResolvedMessaging> {
    try {
        const messagingResponse = await fetchApi<
            FetchApiResponse<ApiMessagingResponseData>
        >(
            `https://api.ecoledirecte.com/v3/eleves/{USER_ID}/messages.awp?force=false&typeRecuperation=${typeOfRecovery}&idClasseur=${binderId}&orderBy=date&order=desc&query=&onlyRead=&page=${page}&itemsPerPage=${itemsPerPage}&getAll=0&verbe=get&{API_VERSION}`,
            {
                headers: { "X-Token": token },
                method: "POST",
            }
        );
        if (!messagingResponse || messagingResponse.isDataEmpty) {
            return DEFAULT_MESSAGING;
        }

        const {
            messages,
            pagination,
            classeurs: folders,
            parametrage: settings,
        } = messagingResponse.data;

        const foldersById = (folders || []).reduce<Record<number, string>>(
            (acc, { id, libelle }) => {
                acc[id] = libelle;
                return acc;
            },
            {}
        );

        const received = (messages?.received || []).map((m) =>
            formatMessage(m, foldersById)
        );
        const sent = (messages?.sent || []).map((m) =>
            formatMessage(m, foldersById)
        );
        const draft = (messages?.draft || []).map((m) =>
            formatMessage(m, foldersById)
        );
        const archived = (messages?.archived || []).map((m) =>
            formatMessage(m, foldersById)
        );

        return {
            received,
            sent,
            draft,
            archived,
            folders: (folders || []).map(({ id, libelle }) => ({
                id,
                name: libelle,
                messages: received.filter((m) => m.folder.id === id),
            })),
            pagination: {
                receivedCount: pagination?.messagesRecusCount || 0,
                sentCount: pagination?.messagesEnvoyesCount || 0,
                draftCount: pagination?.messagesDraftCount || 0,
                archivedCount: pagination?.messagesArchivesCount || 0,
                unreadCount: pagination?.messagesRecusNotReadCount || 0,
            },
            settings: {
                isActive: settings?.isActif || false,
                canContactTeachers: settings?.destProf || false,
                canContactAdmin: settings?.destAdmin || false,
                canContactStudents: settings?.destEleve || false,
                canContactFamilies: settings?.destFamille || false,
                canContactCompanies: settings?.destEntreprise || false,
            },
        };
    } catch (e) {
        console.log("Error inside messaging resolver:", e);
        throw e;
    }
}

function formatSender(from?: ApiMessageSender): MessageSender {
    if (!from) {
        return {
            id: null,
            fullName: "Inconnu",
            firstName: "",
            lastName: "",
            initials: "?",
            role: null,
        };
    }

    const fullName =
        [from.civilite, from.prenom, from.particule, from.nom]
            .filter(Boolean)
            .join(" ")
            .trim() || "Inconnu";

    return {
        id: from.id || null,
        fullName,
        firstName: from.prenom || "",
        lastName: from.nom || "",
        initials: getInitials(from),
        role: from.role || null,
    };
}

function getInitials(from?: ApiMessageSender): string {
    if (!from) return "?";
    const first = from.prenom?.[0] || "";
    const last = from.nom?.[0] || "";
    return `${first}${last}`.toUpperCase() || "?";
}

function formatMessage(
    msg: ApiMessage,
    foldersById: Record<number, string> = {}
): FormattedMessage {
    const fullSenderName =
        [msg.from.civilite, msg.from.prenom, msg.from.particule, msg.from.nom]
            .filter(Boolean)
            .join(" ")
            .trim() || "Inconnu";
    return {
        id: msg.id,
        subject: msg.subject || "(Sans objet)",
        date: msg.date.replace(" ", "T"),
        read: msg.read,
        answered: msg.answered,
        transferred: msg.transferred,
        canAnswer: msg.canAnswer,
        type: msg.mtype,
        folder: {
            id: msg.idClasseur || null,
            name: foldersById[msg.idClasseur] || null,
        },
        files: (msg.files || []).map((f) => ({
            id: f.id,
            libelle: f.libelle || "",
            type: f.type || "",
        })) as MessageAttachment[],
        recipientType: msg.to_cc_cci || null,
        sender: formatSender(msg.from),
    };
}
const formatMode = {
    recipient: "destinataire",
    sender: "expediteur",
};

export async function messageContentResolver({
    token,
    messageId,
    mode = "recipient",
}: MessageContentResolverParams): Promise<MessageContent | null> {
    try {
        const response = await fetchApi<FetchApiResponse<any>>(
            `https://api.ecoledirecte.com/v3/eleves/{USER_ID}/messages/${messageId}.awp?verbe=get&mode=${formatMode[mode]}&{API_VERSION}`,
            {
                headers: { "X-Token": token },
                method: "POST",
                body: {
                    anneeMessages: "2026-2027",
                },
            }
        );
        if (!response || !response.data || response.isDataEmpty) return null;

        const msg = response.data;
        return {
            id: msg.id,
            content: base64Handler.decode(msg.content || ""),
            files: (msg.files || []).map((f: any) => ({
                id: f.id,
                libelle: f.libelle || "",
                type: f.type || "",
                ...f,
            })) as MessageAttachment[],
        };
    } catch (e) {
        console.log("Error fetching message content:", e);
        throw e;
    }
}
