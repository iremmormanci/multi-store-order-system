export type Product={
    id: string;
    name: string;
    price: number;            
    stock:{value:number,reserve:number }
  };

export type User={
    id: string;
    name: string;
    surname:string;
    phone: string; 
    email:string;  
    location: Location        
  };
  
export type Cart={
    id:string;
    userId:string;
    items: { productId: string; quantity: number; storeId: string }[];
    createdAt: string;
  }
  export type Store = {
    id: string;
    name: string;
    location: Location
    products: { productId: string, quantity: number }[],
  };
  export interface Location {
    latitude: number;
    longitude: number;
  }
  export type Order={
    id:string;
    userId:string;
    total:number;
    items: { productId: string; quantity: number }[];
    createdAt: string;
    location: Location;
    storeId:string;
  }