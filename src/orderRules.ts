import { Cart,Product,Order, Store } from "./type";
import { readDB,writeDB } from "./userRules";
import { ulid} from "ulid";
import { findStoreForAllItems } from "./storeRules";

export function addOrder(parameters:{
    userId:string;
    items: { productId: string; quantity: number }[];
    createdAt: string;
    stores:Store[] //
}): { success: boolean; message: string; order?:Order}{
    const db=readDB();
    const{userId,items,createdAt,stores}=parameters;

      // Kullanıcı bul
    const user = db.users.find(u => u.id === userId);
    if (!user) return { success: false, message: "Kullanıcı bulunamadı." };

    //kullanıcı sepeti bulma
    const cart = db.carts.find(c => c.userId === userId);
    if (!cart) return { success: false, message: "Kullanıcının sepeti bulunamadı." };

     // Tüm ürünleri karşılayacak mağazayı bul
  const store = findStoreForAllItems(user, items, stores);
  if (!store) {
    return { success: false, message: "Tüm ürünlerin stokta olduğu tek mağaza bulunamadı." };
  }
    let total=0
    let storeId: string | null = null;
    //Bu siparişte hangi ürünlerden kaç adet alınmış?
    for (const item of items) {
        const product=db.products.find(p=> p.id === item.productId);
        total+=product?.price ?? 0 //toplama işlemi 
            if(!product){
         return { success: false, message: `Ürün bulunamadı: ${item.productId}` };
        }
     
        // Bu ürün hangi mağazada var?
     const store = db.stores.find(s =>
        s.products.some(sp => sp.productId === item.productId && sp.quantity >= item.quantity)
      );
  
      if (!store) {
        return { success: false, message: `Ürün stokta yok: ${item.productId}` };
      }
  
      // Her sipariş tek mağazadan gelmeli — mağaza uyuşmazlığı varsa iptal et
      if (storeId && store.id !== storeId) {
        return {
          success: false,
          message: `Tüm ürünler aynı mağazadan alınmalıdır. Çakışma: ${store.name}`,
        };
      }
  
      storeId = store.id; // ilk ürünün mağazası

      product.stock.value-= item.quantity
      product.stock.reserve -= item.quantity;
    }
    const newOrder:Order={
        id:ulid(),
        userId,
        total,
        items,
        createdAt,
        location:user.location,
        storeId:storeId!
    };
        db.orders.push(newOrder);
        cart.items = [];
    writeDB(db)
    return{
        success: true,message: "Sipariş başarıyla oluşturuldu"
    }


}