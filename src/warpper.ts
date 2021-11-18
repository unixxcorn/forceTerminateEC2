import AWS from 'aws-sdk';

AWS.config.loadFromPath('./credential.json')

export function regionsList(): Promise<AWS.EC2.DescribeRegionsResult> {
    const ec2 = new AWS.EC2({
        region: 'us-east-1'
    })
    return new Promise((resolve, reject) => {
        ec2.describeRegions((error, data) => {
            if (error)
                reject(error);
            else
                resolve(data);
        });
    });

};

export function listInstances(region: string): Promise<AWS.EC2.DescribeInstancesResult | undefined> {
    return new Promise((resolve, reject) => {
        const ec2 = new AWS.EC2({
            region: region
        })
        ec2.describeInstances((error, data) => {
            if (error)
                reject(error);
            else
                resolve(data);
        });
    });
};

export function terminateInstances(instance:string, region:string){
    return new Promise((resolve, reject) => {
        const ec2 = new AWS.EC2({
            region: region
        })
        const modifyParams = {
            InstanceId: instance, 
            DisableApiTermination: {
                Value: false
            },
        
           };
        const deleteParams = {
            InstanceIds: [
                instance
            ]
        }
        ec2.modifyInstanceAttribute(modifyParams, ((error) => {
            if(error) reject(error);
            ec2.terminateInstances(deleteParams, (error, data) => {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        }))
    });
}
