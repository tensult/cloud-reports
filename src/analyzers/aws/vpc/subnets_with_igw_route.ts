import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class SubnetsWithIgwRouteAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allSubnets = params.subnets;
        const allRoutes = params.route_tables;
        if (!allSubnets || !allRoutes) {
            return undefined;
        }
        const subnets_with_igw_route: CheckAnalysisResult = {type: CheckAnalysisType.Security};
        subnets_with_igw_route.what = "Which subnets have route to public?";
        subnets_with_igw_route.why = "It is important to know which subnets have routes to public and can become valnerable to attacks. Also sometimes we misconfigure private subnets with public routes"
        subnets_with_igw_route.recommendation = "Recommended to keep only private routes for private subnets and protect public subnets with network acls";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allSubnets) {
            let regionSubnets = allSubnets[region];
            allRegionsAnalysis[region] = [];
            for (let subnet of regionSubnets) {
                if(subnet.DefaultForAz) {
                    continue;
                }
                let subnetAnalysis: ResourceAnalysisResult = {};
                let subnetRouteTable = this.getSubnetRouteTable(subnet.SubnetId, subnet.VpcId, allRoutes[region]);
                subnetAnalysis.resource = { subnetName: this.getName(subnet), id: subnet.SubnetId, route_table: subnetRouteTable };
                subnetAnalysis.resourceSummary = {
                    name: 'Subnet', 
                    value: `${subnetAnalysis.resource.subnetName} | ${subnet.SubnetId}`
                }
                if (this.doesRouteTableContainIgwRoute(subnetRouteTable)) {
                    subnetAnalysis.severity = SeverityStatus.Warning;
                    subnetAnalysis.message = 'Subnet has route to the world';
                    subnetAnalysis.action = "If the subnet is private then it shouldn't have route to the world"
                } else {
                    subnetAnalysis.severity = SeverityStatus.Good;
                    subnetAnalysis.message = 'Subnet does not have route to the world';
                }
                allRegionsAnalysis[region].push(subnetAnalysis);
            }
        }
        subnets_with_igw_route.regions = allRegionsAnalysis;
        return { subnets_with_igw_route };
    }

    private doesRouteTableContainIgwRoute(routeTable: any) {
        return routeTable.Routes.filter((route) => {
            if (route.GatewayId) {
                return route.GatewayId.startsWith('igw-') && route.State === 'active';
            }
            return false;
        }).length > 0;
    }

    private getName(subnet: any) {
        const nameTags = subnet.Tags.filter((tag) => {
            return tag.Key == 'Name';
        });
        if (nameTags.length) {
            return nameTags[0].Value;
        } else {
            return 'Unassigned';
        }
    }

    private getSubnetRouteTable(subnetId: string, vpcId: string, routeTables: any[]) {
        return routeTables.filter((routeTable) => {
            if(routeTable.VpcId !== vpcId) {
                return false;
            }
            return routeTable.Associations.filter((association) => {
                return association.SubnetId === subnetId;
            }).length || routeTable.Associations.filter((association) => {
                return association.Main;
            }).length;
        })[0];
    }
}