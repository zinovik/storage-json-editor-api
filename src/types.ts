export interface AlbumInterface {
    path: string;
    title: string;
    text?: string | string[];
}

export interface FileInterface {
    path: string;
    filename: string;
    type: 'image' | 'video';
    isTitle?: boolean;
    isNoThumbnail?: boolean;
    description?: string;
    text?: string | string[];
    isVertical?: boolean;
}
