import { Cart,Product,Store } from "./type";
import { readDB,writeDB } from "./userRules";
import { getNearestStoreWithProduct } from "./storeRules";

export function addToCart(parameters:{
    userId:string;
    productId: string; 
    quantity: number;
    stores: Store[];//dbden oku
}): { success: boolean; message: string; carts?:Cart }{
    const db=readDB();
    const{userId, productId,quantity,stores}=parameters;

     // Kullanıcı bul
    const user = db.users.find(u => u.id === userId);
    if (!user) return { success: false, message: "Kullanıcı bulunamadı." };

    //kullanıcı sepeti bulma
    const cart = db.carts.find(c => c.userId === userId);
    if (!cart) return { success: false, message: "Kullanıcının sepeti bulunamadı." };
  
    //ürün bul
    const product=db.products.find(p=> p.id === productId);
    if(!product)
    return{success:false, message:"Ürün bulunamadı"}

    // Kullanıcının konumuna göre en yakın ve ürünü stokta olan mağazayı bul
    //bunun içerisinde altt<ki kontroller önce müsait stok
    const nearestStore = getNearestStoreWithProduct(user, productId, stores, quantity, product);

    if (!nearestStore) {
        return { success: false, message: "Ürün stoğu yeterli olan mağaza bulunamadı." };
  }

  // Mağazadaki ürün stok kontrolü 

    //rezerve miktarı
    const reserved = product.stock.reserve || 0; //
    const availableStock=product.stock.value-reserved;

    //Ürün sepette var mı???
    const basketItem=cart.items.find(item=> item.productId ===productId)

    if(basketItem){
        basketItem.quantity+=quantity;
    }else{
        cart.items.push({productId,quantity, storeId:nearestStore.id})
    }

    //reserve mikatını güncelleme
    product.stock.reserve=reserved +quantity
        writeDB(db)
        return{
            success: true,message: "Ürün sepete eklendi"
        }
}

export function deleteCart(productId:string, userId:string, storeId:string):
{success:boolean, message:string}{
    const db=readDB();

    const cart = db.carts.find(c => c.userId === userId);
    if (!cart) return { success: false, message: "Kullanıcının sepeti bulunamadı." };

    const product=db.products.find(p=> p.id === productId);
    if(!product)
    return{success:false, message:"Ürün bulunamadı"}

  // Artık hem productId hem storeId eşleşmeli
    const item = cart.items.find(i => i.productId === productId && i.storeId === storeId);
    if (!item) return { success: false, message: "Ürün bu mağazadan sepette bulunamadı." };

    cart.items = cart.items.filter(i => !(i.productId === productId && i.storeId === storeId));
    
    product.stock.reserve-= item.quantity

    writeDB(db);
  return { success: true, message: "Ürün sepetten çıkarıldı." };
}
