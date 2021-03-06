import { LogErrorTopics } from './logErrorTopics.model';
import { LogClusterTags } from './logClusterTags.model';
import { element } from 'protractor';

export class CreateLogTemplate {
    templateName: string;
    monitoringProvider: string;
    autoBaseline: boolean;
    sensitivity: string;
    accountName: string;
    namespace: string;
    index: string;
    kibanaIndex: string;
    regExFilter: boolean;
    regExResponseKey: string;
    regularExpression: string;
    clusterTagId: boolean;
    errorTopics:LogErrorTopics[];
    clustertagList: LogClusterTags[];
    
    constructor(data: any) {
        data = data || {};
        this.templateName = data.templateName;
        this.monitoringProvider = data.monitoringProvider;
        this.autoBaseline = data.autoBaseline;
        this.sensitivity = data.sensitivity;
        this.accountName = data.accountName;
        this.namespace = data.namespace;
        this.index = data.index;
        this.kibanaIndex = data.kibanaIndex;
        this.regExFilter = data.regExFilter;
        this.regExResponseKey = data.regExResponseKey;
        this.regularExpression = data.regularExpression;
        this.clusterTagId = data.clusterTagId;
        this.errorTopics=[];
        data.errorTopics.forEach(element => {
            this.errorTopics.push(new LogErrorTopics(element));
        });
        this.clustertagList = [];
        data.tag.forEach(element => {
            this.clustertagList.push(new LogClusterTags(element));
        })
       
    }
}
