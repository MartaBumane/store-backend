import csv from 'csvtojson';
import { Request, Response } from 'express';
import { Item, Config, CalculatePriceBody} from './interfaces';
import { resolve } from 'path';
import { config } from "./configController";

const csvFilePath = resolve(__dirname, '../store.csv');
console.log("Directory:", csvFilePath);

const toItem = (line: any) => {
  return {
    id: line.id,
    title: line.title,
    description: line.description,
    image: line.image,
    expectedDeliveryDate: line.expected_delivery_date,
    seller: line.seller,
    sellerImage: line.seller_image
  } as Item
}

let counter = 1;
export function updateCounter() {
  counter = 1;
}

function serverStatus(config: Config, req: string): any {
  if (req === config.servers[0].name) {
    if (counter <= config.servers[0].errorFrequency) {
      if (counter === 10) {
        counter = 1;
      } else {
        counter++;
      }
      return 500;
    } else {
      if (counter === 10) {
        counter = 1;
      } else {
        counter++;
      }
      return 200;
    }
  } else {
    return 500;
  }
}


export class ItemsController {


  static getSingleItem(_req: Request, res: Response) {
    const id: string = (_req.params as any).id;

    csv()
      .fromFile(csvFilePath)
      .then(
        (lines: Item[]) => {
          const line = lines.find(line => line.id.toString() === id)
          if (line !== undefined) {
            
            res.json(toItem(line));
          } else {
            res.status(404).send('Could not find the id you requested');
          }
        }, (e: Error) => {
          res.status(500).send(`Sorry - was unable to open csv database: ${e.message}`);
        });
  }


  static getItemQuantity(_req: Request, res: Response){
    const id: string = (_req.params as any).id;

    csv()
      .fromFile(csvFilePath)
      .then(
        (lines) => {
          const line = lines.find(line => line.id.toString() === id)
          if (line !== undefined) {
            
            res.json(parseInt(line.quantity));
          } else {
            res.status(404).send('Could not find the id you requested');
          }
        }, (e: Error) => {
          res.status(500).send(`Sorry - was unable to open csv database: ${e.message}`);
        });
  }

  static calculatePrice (req: Request, res: Response) {
    const id: string = (req.params as any).id;
    const body = req.body as CalculatePriceBody;

    csv()
        .fromFile(csvFilePath)
        .then(
          (lines) => {
            const line = lines.find(line => line.id.toString() === id);
            
            if(body.quantity===undefined){
              res.status(400).send('Quantity is not specified');
              return;
            }

            if (line !== undefined) {  
              if(body.quantity>line.quantity){
                res.status(400).send('This quantity could not be delivered');
                return;
              }
              const price =parseFloat(line.price);
                  
              if(line.sale!==''){
                let saleNameSplited = line.sale.split(' ');
                let x = parseInt(saleNameSplited[0]);
                let y = parseInt(saleNameSplited[2]);

                if(body.quantity>y){
                  let payForThisQuantity = body.quantity - Math.ceil(body.quantity/x)+1;
                  res.send((price*payForThisQuantity).toString() + ' EUR'); 
                  return
                }
              }

              res.send((price*body.quantity).toString() + ' EUR');                          

              } else {
                res.status(404).send('Could not find the id you requested');
              }
          }, (e: Error) => {
            res.status(500).send(`Sorry - was unable to open csv database: ${e.message}`);
          });
}


  static getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 25;

    const reqServer = (req.params as any).server;

    if (serverStatus(config, reqServer) === 500) {
      res.status(500).send("server error");
    } else {

      csv().fromFile(csvFilePath)
        .then((items) => {
          
          res.send({
            page: page,
            totalPages: Math.ceil(items.length / size),
            totalItems: items.length,
            items: items.map(toItem).slice(page * size, page * size + size)
          })
        });
  }
}
}

