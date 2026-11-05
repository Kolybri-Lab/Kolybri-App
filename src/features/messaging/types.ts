export interface ApiMessageSender {
    id: number;
    civilite?: string;
    prenom?: string;
    nom?: string;
    particule?: string;
    role?: string;
}

export interface ApiMessageFile {
    id: number | string;
    libelle: string;
    type: string;
}

export interface ApiMessage {
    id: number;
    subject?: string;
    date: string;
    read: boolean;
    answered: boolean;
    transferred: boolean;
    canAnswer: boolean;
    mtype: string;
    idClasseur: number;
    files?: ApiMessageFile[];
    to_cc_cci?: string;
    from?: ApiMessageSender;
}

export interface ApiMessagingResponseData {
    messages: {
        received?: ApiMessage[];
        sent?: ApiMessage[];
        draft?: ApiMessage[];
        archived?: ApiMessage[];
    };
    pagination: {
        messagesRecusCount: number;
        messagesEnvoyesCount: number;
        messagesDraftCount: number;
        messagesArchivesCount: number;
        messagesRecusNotReadCount: number;
    };
    classeurs: Array<{ id: number; libelle: string }>;
    parametrage: {
        isActif: boolean;
        destProf: boolean;
        destAdmin: boolean;
        destEleve: boolean;
        destFamille: boolean;
        destEntreprise: boolean;
    };
}

export interface MessageAttachment {
    id: number | string;
    libelle: string;
    type: string;
}

export interface MessageSender {
    id: number | null;
    fullName: string;
    firstName: string;
    lastName: string;
    initials: string;
    role: string | null;
}

export interface FormattedMessage {
    id: number;
    subject: string;
    date: string;
    read: boolean;
    answered: boolean;
    transferred: boolean;
    canAnswer: boolean;
    type: string;
    folder: { id: number | null; name: string | null };
    files: MessageAttachment[];
    recipientType: string | null;
    sender: MessageSender;
}

export interface MessageFolder {
    id: number;
    name: string;
    messages: FormattedMessage[];
}

export interface MessagePagination {
    receivedCount: number;
    sentCount: number;
    draftCount: number;
    archivedCount: number;
    unreadCount: number;
}

export interface MessageSettings {
    isActive: boolean;
    canContactTeachers: boolean;
    canContactAdmin: boolean;
    canContactStudents: boolean;
    canContactFamilies: boolean;
    canContactCompanies: boolean;
}

export interface ResolvedMessaging {
    received: FormattedMessage[];
    sent: FormattedMessage[];
    draft: FormattedMessage[];
    archived: FormattedMessage[];
    folders: MessageFolder[];
    pagination: MessagePagination;
    settings: MessageSettings;
}

export interface MessageContent {
    id: number;
    content: string;
    files: MessageAttachment[];
}

export interface MessagingResolverParams {
    token: string;
    page?: number;
    itemsPerPage?: number;
    typeOfRecovery?: "received" | "sent" | "draft" | "archived";
    binderId?: number;
}

export interface MessageContentResolverParams {
    token: string;
    messageId: number | string;
    mode?: "recipient" | "sender";
}
