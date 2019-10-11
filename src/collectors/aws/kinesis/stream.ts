import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import {KinesisStreamListCollector} from './stream_list'

export class KinesisStreamCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllStreams();
    }

    private async getAllStreams() {

        const self = this;
        const serviceName = "Kinesis";
        const kinesisRegions = self.getRegions(serviceName);
        const stream = {};
        // getting stream names from stream_list
        const KinesisStreamListCollectorInstance = new KinesisStreamListCollector();
        const streamNamesObj = await KinesisStreamListCollectorInstance.getAllStreamNames()
        
        for (const region of kinesisRegions) {
            try {
                const Kinesis = self.getClient(serviceName, region) as AWS.Kinesis;
                stream[region] = [];
                let fetchPending = true;
                let token: string | undefined = undefined;
            
                const params = {} as any;
                const streamName=streamNamesObj[region];
                
               for(const name in streamName){
                   if(name){
                        params.StreamName=name;
                    }
                    while (fetchPending) {                    
                        const streamResponse:
                            AWS.Kinesis.Types.DescribeStreamOutput = await Kinesis.describeStream
                                (params).promise();
                        stream[region] = stream[region].concat(streamResponse.StreamDescription);
                        fetchPending = token !== undefined && token !== null;
                        await CommonUtil.wait(600);
                    }
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { stream };
    }
}