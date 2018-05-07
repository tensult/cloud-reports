import * as AWS from 'aws-sdk';
import { CredentialsUtil } from './utils';

function validateInput(input: any) {
    if(!input.accountInfo || !input.accountInfo.roleArn || !input.accountInfo.externalId) {
        throw new Error("AccountInfo is incomplete");
    }
}



exports.handler = async (event, context, callback) => {
    console.log("Received event", JSON.stringify(event));
    try{
        validateInput(event);
        const roleCredentials = await CredentialsUtil.getCredentialsFromRole(event.accountInfo);

    } catch(error) {
        callback(error);
    }
 }