import { getDistance } from 'geolib';
import { Cart,Product,Order,Store, User } from "./type";

//iki konum arasındaki mesafeyi hesaplar.
export function calculateDistance(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ): number {
    return getDistance(a, b);
  }
//Belirli bir ürün için, müşteriye en yakın mağazayı bul
export function getNearestStoreWithProduct(
    user: User,
    productId: string,
    stores: Store[],
    quantity: number,
    product: Product
  ): Store | null { //fonksiyon dönüş tipi bulamazsa null
    let nearestStore: Store | null = null; //en yakın mağaza başta null
    let shortestDistance = Infinity;

    //ÖNCE GENEL STOK KONTROLÜ YAPTIM
    const reserved = product.stock.reserve || 0;
    const availableStock = product.stock.value - reserved;
  
    if (availableStock < quantity) {
      return null; // Genel stok yetersizse işlem yapma
    }
    
    //mağazaları gez
    for (const store of stores) {
      // Bu mağazada istenen ürün var mı ve stokta mı?
      const productInStock = store.products.find(
        (p) => p.productId.toString() === productId && p.quantity > 0
      );
  
      if (!productInStock) continue; //stok yoksa mağazayı atla
  
      // Müşteri ile mağaza arasındaki mesafeyi hesapla
      const distance = calculateDistance(user.location, store.location);
  
      // En yakın mağazayı güncelle
      //hesaplanan değer şu ana kadar bulunan mesafeden küçükse en yakın mağaza
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStore = store;
      }
    }
    return nearestStore;
  }

  // En yakın uygun mağazaları sırayla döner (stok olup olmadığını kontrol etmez)
  export function getStoresWithProductSortedByDistance(
    user:User,
    stores: Store[]
  ): Store[] {
    return stores
    //some? Dizideki en az bir eleman belirli bir şarta uyuyorsa true döner
      .sort((a, b) =>
        calculateDistance(user.location, a.location) -
        calculateDistance(user.location, b.location)
      );
  }
//Tüm ürünleri karşılayan en yakın mağazayı bulma
 export function findStoreForAllItems(
    user: User,
    items: { productId: string; quantity: number }[],
    stores: Store[]
  ): Store | null {
    const sortedStores = getStoresWithProductSortedByDistance(user, stores); //kullanıcıya en yakın mağazalar
  
    //sıralanmış mağazaları döndüm
    for (const store of sortedStores) {
      //every: dizideki her eleman verilen şart için doğruysa true bir tane bile yanlışsa false döner.
      const canFulfillAll = items.every(item => {//her ürün mağazada yeterince stoğu var mı?
        const storeProduct = store.products.find(p => p.productId === item.productId);
        return storeProduct && storeProduct.quantity >= item.quantity;
      });
      if (canFulfillAll) return store;
    }
    return null;
  }
  