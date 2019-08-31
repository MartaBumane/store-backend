import { Request, Response } from 'express';
import { updateCounter } from "./itemsController";
import { Config } from './interfaces';

export let config : Config= {
  servers: [
    {
      name: "alpha",
      errorFrequency: 0
    }
  ]
};


export class ConfigController {

    static isInvalid(obj1: any): boolean{       
      let objBody = Object.keys(obj1);          

       if(objBody.length<1 ||obj1.servers.length <= 0){
         return true;
       }
       
       if(obj1.servers[0].name===null||obj1.servers[0].name===''){
        return true;
       }

       if (typeof obj1.servers[0].name !== 'string' ||typeof obj1.servers[0].errorFrequency !== 'number') {
        return true;
      }

       if(parseInt(obj1.servers[0].errorFrequency)<0||parseInt(obj1.servers[0].errorFrequency)>10){
        return true;
      }       

        return false;
    }
  

    static getConfig(_req: Request, res: Response) {
      res.status(200).send(config);
    }

    static updateConfig(req: Request, res: Response){ 
      const request= req.body as Config;
      if(ConfigController.isInvalid(request)){
        res.status(400).send('Invalid config');
        updateCounter();

        return
      }

      config = request;
      res.status(200).send(request);
      updateCounter();

    }

}