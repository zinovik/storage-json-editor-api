export interface StorageService {
    getBucketNames(): Promise<string[]>;
    getFileNames(bucketName: string): Promise<string[]>;
    getFile(bucketName: string, fileName: string): Promise<string>;
    saveFile(
        bucketName: string,
        fileName: string,
        file: Object,
        isPublic?: boolean
    ): Promise<{ url: string }>;
}
