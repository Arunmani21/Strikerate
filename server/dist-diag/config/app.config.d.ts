declare const _default: (() => {
    port: number;
    jwt: {
        secret: string;
        expiresIn: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    jwt: {
        secret: string;
        expiresIn: string;
    };
}>;
export default _default;
