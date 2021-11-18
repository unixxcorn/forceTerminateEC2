import inquirer from 'inquirer'
import moment from 'moment';
import { listInstances, regionsList, terminateInstances } from './warpper'
import cliProgress from 'cli-progress'

async function main() {
    try {
        const [regions] = await Promise.all([
            regionsList(),
        ]).then(([regions]) => {
            return [regions.Regions]
        })
        if (!regions) {
            throw new Error('Cannot fetch regions');

        }
        const allRegionsInstances: {
            InstanceId: string,
            InstanceType: string,
            Name: string,
            Region: string,
            Owner: string,
            KeyPairName: string,
            AZ: string,
            IP: string,
            VPC: string,
            Hypervisor: string,
            State: string,
            LaunchTime: string,
        }[] = []
        inquirer
            .prompt([
                {
                    type: 'checkbox',
                    name: 'regions',
                    message: 'Which regions do you want to list?',
                    choices: regions.map(region => region.RegionName),
                },
            ])
            .then(async (selected) => {
                const regionsListingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                console.log("Loading instances from selected regions")
                regionsListingBar.start(selected.regions.length, 0)
                for (const region of selected.regions) {
                    const instances = (await listInstances(region))?.Reservations
                    if (instances) {
                        for (const instanceList of instances) {
                            if (instanceList.Instances) {
                                for (const instance of instanceList.Instances) {
                                    const mappedData = {
                                        InstanceId: instance.InstanceId || '-',
                                        InstanceType: instance.InstanceType || '-',
                                        Name: instance.Tags?.find(row => row.Key == 'Name')?.Value || '-',
                                        Region: region,
                                        Owner: instanceList.OwnerId || '-',
                                        KeyPairName: instance.KeyName || "-",
                                        AZ: instance.Placement?.AvailabilityZone || "-",
                                        IP: instance.PrivateIpAddress || "-",
                                        VPC: instance.VpcId || "-",
                                        Hypervisor: instance.Hypervisor || "Unknown",
                                        State: instance.State?.Name || 'Unknown',
                                        LaunchTime: moment(instance.LaunchTime).format("YYYY:MM:DD HH:MM:SS ZZ")
                                    }
                                    allRegionsInstances.push(mappedData)
                                }
                            }
                        }
                    }
                    regionsListingBar.increment()
                }
                regionsListingBar.stop()
                console.table(allRegionsInstances, ['Name', 'InstanceType', 'InstanceId', 'AZ', 'KeyPairName','LaunchTime'])
            }).then(() => {
                inquirer
                .prompt([
                    {
                        type: 'checkbox',
                        name: 'instances',
                        message: 'Which instances do you want to TERMINATE?',
                        choices: allRegionsInstances.map(instance => `\x1b[32m${instance.InstanceId}\x1b[33m ${instance.Name}\x1b[34m ${instance.AZ}\x1b[36m ${instance.InstanceType}\x1b[33m ${instance.KeyPairName}\x1b[34m ${instance.LaunchTime}\x1b[0m`),
                    },
                ])
                .then((selected) => {
                    const instances = selected.instances.map((instance:string) => instance.split('\x1b[33m')[0].split('\x1b[32m')[1])
                    const terminationBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                    terminationBar.start(instances.length, 0)
                    for (const instance of instances) {
                        const instanceObject = allRegionsInstances.find(ins => ins.InstanceId == instance)
                        if(instanceObject){
                            // console.table(allRegionsInstances.find(ins => ins.InstanceId == instance))
                            terminateInstances(instanceObject.InstanceId, instanceObject.Region)
                        }
                        terminationBar.increment()
                    }
                    terminationBar.stop()
                    
                }).then(() => {
                    console.log('COMPLETE')
                })
            });
    } catch (error) {
        console.error(error)
    }
}
console.log("\x1b[41m\x1b[37mCAUTION!: We are not responsible for any damage from using this software.Please use it at your own risk and use it carefully.\x1b[0m")
main()