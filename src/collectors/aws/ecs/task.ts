import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";


export class ECSTaskCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllTask();
    }

    private async getAllTask() {

        const self = this;
        const serviceName = "ECS";
        const ecsRegions = self.getRegions(serviceName);
        const taskList = {};

        for (const region of ecsRegions) {
            try {
                const ecs = self.getClient(serviceName, region) as AWS.ECS;
                taskList[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const taskResponse:
                        AWS.ECS.Types.DescribeTasksResponse = await ecs.describeTasks
                            ({ tasks : [ "string" ] }).promise();
                            taskList[region] = taskList[region].concat(taskResponse.tasks);
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { taskList };
    }
}
