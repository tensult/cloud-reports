import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import {KinesisStreamListCollector} from './stream_list'

export class KinesisShardListCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllShards();
    }

    private async getAllShards() {

        const self = this;
        const serviceName = "Kinesis";
        const kinesisRegions = self.getRegions(serviceName);
        const shard_list = {};
        // getting stream names from stream_list
        const KinesisStreamListCollectorInstance = new KinesisStreamListCollector();
        const streamNamesObj = await KinesisStreamListCollectorInstance.getAllStreamNames()
        
        for (const region of kinesisRegions) {
            try {
                const Kinesis = self.getClient(serviceName, region) as AWS.Kinesis;
                shard_list[region] = [];
                let fetchPending = true;
                let token: string | undefined = undefined;
            
                const params = {} as any;
                const streamName=streamNamesObj[region];
               for(const name in streamName){
                   if(name){
                        params.StreamName=name;
                    }
                    while (fetchPending) {                    
                        const shardlistResponse:
                            AWS.Kinesis.Types.ListShardsOutput = await Kinesis.listShards
                                (params).promise();
                        shard_list[region] = shard_list[region].concat(shardlistResponse.Shards);
                        token = shardlistResponse.NextToken;
                        fetchPending = token !== undefined && token !== null;
                        await CommonUtil.wait(600);
                    }
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { shard_list };
    }
}