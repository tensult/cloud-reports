import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { Integer } from "aws-sdk/clients/sqs";

export class KinesisStreamListCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllStreamNames();
    }

    public async getAllStreamNames() {
        const streams = await this.getAllStreams()
        return streams.stream_list;
    }

    private async getAllStreams() {

        const self = this;
        const serviceName = "Kinesis";
        const kinesisRegions = self.getRegions(serviceName);
        const stream_list = {};

        for (const region of kinesisRegions) {
            try {
                const Kinesis = self.getClient(serviceName, region) as AWS.Kinesis;
                stream_list[region] = [];
                let fetchPending = true;
                let limit: Integer | undefined;
                while (fetchPending) {
                    const streamListResponse:
                        AWS.Kinesis.Types.ListStreamsOutput = await Kinesis.listStreams
                            ({ Limit: limit }).promise();
                    stream_list[region] = stream_list[region].concat(streamListResponse.StreamNames);
                    
                    fetchPending = limit !== undefined;
                    
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { stream_list };
    }
}