export class ResourceUtil {
    public static getNameByTags(resource: any) {
        if (!resource.Tags) {
            return "Untagged";
        }
        const nameTags = resource.Tags.filter((tag) => {
            return tag.Key === "Name";
        });
        if (nameTags.length) {
            return nameTags[0].Value;
        } else {
            return "Untagged";
        }
    }
}
