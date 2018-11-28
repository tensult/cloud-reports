export class CloudFrontUtil {
    public static getAliasName(distribution) {
        if (!distribution || !distribution.Aliases) {
            return undefined;
        }
        return distribution.Aliases.Items[0];
    }
}
