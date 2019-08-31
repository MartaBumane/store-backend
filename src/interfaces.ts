export interface Item {
  id: string;
  title: string;
  description: string;
  image: string;
  expectedDeliveryDate: string;
  seller: string;
  sellerImage: string;
}

export interface ServerItem {
  name: string;
  errorFrequency: number;
}

export type ServerItems = ServerItem[];

export interface Config {
  servers: ServerItems;
}

export interface CalculatePriceBody{
  quantity: number;
}