export interface AuthorizationService {
    verify(token: string): Promise<string>;
}
