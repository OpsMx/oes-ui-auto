
export class Service {
    name: string;
    id: string;
   

    constructor(data: any) {
        data = data || {};
        this.name = data.serviceName;
        this.id = data.id;
       
    }
}
