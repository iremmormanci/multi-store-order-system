import { Cart,Product } from "./type";
import { readDB,writeDB } from "./userRules";
import { ulid} from "ulid";

export function addProduct(parameters:{
    name: string;
    price: number;            
    stock:{value:number,reserve:number }
}): { success: boolean; message: string; product?:Product }{
    const db=readDB();
    const{name,price,stock:{value,reserve}}=parameters;

    const newProduct:Product={
        id:ulid(),
        name, 
        price,
        stock: {
            value,
            reserve:0,
          },
        };
        db.products.push(newProduct);
    writeDB(db)
    return{
        success: true,message: "Ürün başarıyla eklendi", product:newProduct
    }
}
