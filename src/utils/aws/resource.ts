export class ResourceUtil {
    static getNameByTags(resource: any) {
        const nameTags = resource.Tags.filter((tag) => {
            return tag.Key == 'Name';
        });
        if (nameTags.length) {
            return nameTags[0].Value;
        } else {
            return 'Unassigned';
        }
    }
}