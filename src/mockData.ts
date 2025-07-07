import { ulid } from "ulid";

const userId=ulid()
const productId=ulid()
const storeId=ulid()
export const mockDB=()=>({
    users:[{
      id:userId,
      name:"İrem",
      surname:"Ormancı",
      phone:"5524616059",
      email:"iremxx@gmail.com"}],

    products:[{
      id:productId,
      name:"kalem",
      stock:{value:10,reserve:0}}],

    carts:[{
      userId:userId,
      items:[]}],

      orders:[],

      stores: [{
        id: storeId,
        name: "Mağaza 1",
        location: { latitude: 0, longitude: 0 },
        products: [{ productId: productId, quantity: 10 }]
        }]
  });