export interface DocumentFile {
    fileName: string;
    fileType: string;
    fileId: string | number;
}

export type DownloadProgressMap = Record<string | number, number>;

export type SetDownloadProgress = React.Dispatch<
    React.SetStateAction<DownloadProgressMap>
>;

export interface DocumentActionResult {
    sucess: boolean;
    message: string | unknown;
}
