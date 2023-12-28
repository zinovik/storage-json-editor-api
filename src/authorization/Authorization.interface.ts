export interface Authorization {
    verify(token: string): Promise<string>;
}
