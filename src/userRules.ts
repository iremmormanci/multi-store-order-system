import { Order,Product,User,Cart,Store } from "./type";
import { readFileSync, writeFileSync } from 'fs';
import { ulid} from "ulid";
export const DB_PATH = './db.json';

export function readDB(): {
    products: Product[] 
    users: User[],
    carts: Cart[],
    orders: Order[],
    stores: Store[]
  } {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  }
// DB yazma
export function writeDB(data: {
    products: Product[] 
    users: User[],
    carts: Cart[],
    orders: Order[],
    stores:Store[]
  }) {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }
  export function addUser(parameters:{
    name: string,
    surname:string,
    phone: string; 
    email:string; 
    location: { latitude: number; longitude: number };
  }):{success:boolean; message:string; user? :User}{
    const db=readDB();
    const {name,surname,phone,email,location}=parameters

    // Email
  const userCheckmail = db.users.find(u => u.email === email);
  if (userCheckmail) {
    return {success: false,message: "Bu email zaten kayıtlı",
    };
  }
   //telefon kontrolü
  const userCheckphone = db.users.find(u => u.phone === phone);
  if (userCheckphone) {
    return {success: false,message: "Bu telefon zaten kayıtlı",
    };
  }
    const newUser:User={
        id:ulid(),
        name,
        surname,
        phone,
        email,
        location,
        };
        db.users.push(newUser);
    //kullanıcıya özel cart boş sepet
        db.carts.push({
            id: ulid(),
            userId: newUser.id,
            items: [],
            createdAt: new Date().toISOString(),
          });
        writeDB(db)
        return{
            success: true,message: "Kullanıcı başarı ile eklendi",user:newUser
        }
    }