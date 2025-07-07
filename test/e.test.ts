import test from 'ava';
import fs from 'fs';
import { ulid } from 'ulid';
import { readDB, DB_PATH,addUser } from '../src/userRules';
import { addToCart,deleteCart } from '../src/cartRules';
import { addProduct } from '../src/productRules';
import { addOrder } from '../src/orderRules';
import { mockDB } from '../src/mockData';
import { findStoreForAllItems } from '../src/storeRules';
import { Store, User,Product } from '../src/type';

test.beforeEach(() => {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [],
    carts: [],
    products: [],
    orders: [],
    stores:[],
  }, null, 2));
});
//KULLANICI TESTLERİ
  test('Kullanıcı eklendi mi?',t=>{
    const user={
        name:"İrem",
        surname:"Ormancı",
        phone:"5524616059",
        email:"iremxx@gmail.com",
        location:{ latitude: 0, longitude: 0 }
    }
    const result=addUser(user)
    t.true(result.success);
    t.is(result.message,"Kullanıcı başarı ile eklendi")
  })
  test("E-mail kayıtlı mı?",t=>{
    const user={
      name:"İrem",
      surname:"Ormancı",
      phone:"5524616059",
      email:"iremxx@gmail.com",
      location:{ latitude: 0, longitude: 0 }
  }
    const result=addUser(user)
    t.false(result.success);
    t.is(result.message,"Bu email zaten kayıtlı")
  })
  test("Telefon numarası kayıtlı mı?",t=>{
    const user={
      name:"İrem",
      surname:"Ormancı",
      phone:"5524616059",
      email:"irem@gmail.com",
      location:{ latitude: 0, longitude: 0 }
  }
    const result=addUser(user)
    t.false(result.success);
    t.is(result.message,"Bu telefon zaten kayıtlı")
  })

  //CART TESTLERİ
  test('Ürün başarıyla eklendi mi?',t=>{
    const userId = ulid();
    const productId = ulid();
    const storeId = ulid();

    const initialDB={
      users:[{
        id:userId,
        name:"İrem",
        surname:"Ormancı",
        phone:"5524616059",
        email:"iremxx@gmail.com",
        location:{ latitude: 0, longitude: 0 }
      }],
  
      products:[{
        id:productId,
        name:"kalem",
        price:5,
        stock:{value:10,reserve:0}}],
  
      carts:[{
        id:ulid(),
        userId:userId,
        items:[]}],
        orders:[],

      stores: [{
        id: storeId,
        name: "Mağaza 1",
        location: { latitude: 0, longitude: 0 },
        products: [{ productId: productId, quantity: 10 }]
        }]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    const result = addToCart({ userId, productId, quantity: 3, stores:initialDB.stores});

    t.true(result.success);
    t.is(result.message, "Ürün sepete eklendi");
  })
  test('Geçersiz user id ile sepete ürün ekleme',t=>{
    const initialDB=mockDB()
    const productId=initialDB.products[0].id 
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));

    const fakeId=ulid()
    const result = addToCart({ userId: fakeId, productId, quantity: 1,stores:initialDB.stores });

    t.false(result.success);
  t.is(result.message, "Kullanıcının sepeti bulunamadı.");
  })
  test('Geçersiz productId ile sepete ekleme hata döner', t => {
    const userId = ulid();
    const productId = ulid();
    const storeId=ulid()
    const initialDB={
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
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    const fakeProductId = ulid();
  
    const result = addToCart({ userId, productId: fakeProductId, quantity: 1, stores:initialDB.stores });
  
    t.false(result.success);
    t.is(result.message, "Ürün bulunamadı");
  });

  test('Yeterli stok yoksa hata dönmeli', t => {
    const userId = ulid();
    const productId = ulid();
    const storeId=ulid()
    const initialDB={
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
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
  
    const result = addToCart({ userId, productId, quantity: 15 ,stores:initialDB.stores});
  
    t.false(result.success);
    t.is(result.message, "Yeterli ürün yok");
  });

  test('Sepette ürün varsa miktar artırılır, yeni item eklenmez', t => {
    const userId = ulid();
    const productId = ulid();
    const storeId=ulid()
    const initialDB={
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

    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
  
    // İlk ekleme
    addToCart({ userId, productId, quantity: 2,stores:initialDB.stores });
    // İkinci ekleme (aynı ürün)
    const result = addToCart({ userId, productId, quantity: 3,stores:initialDB.stores });
  
    t.true(result.success);
    t.is(result.message, "Ürün sepete eklendi");
  })
  //CART İÇİN SİLME TESTLERİ
  test('Başarılı ürün çıkarma', t => {
    const userId = ulid();
    const productId = ulid();
    const storeId=ulid()
    const initialDB={
      users:[{
        id:userId,
        name:"İrem",
        surname:"Ormancı",
        phone:"5524616059",
        email:"iremxx@gmail.com"}],
  
      products:[{
        id:productId,
        name:"kalem",
        stock:{value:10,reserve:3}}],
  
      carts:[{
        userId:userId,
        items:[{productId:productId,quantity:3}]}],
  
      orders:[],

      stores: [{
        id: storeId,
        name: "Mağaza 1",
        location: { latitude: 0, longitude: 0 },
        products: [{ productId: productId, quantity: 10 }]
        }]

    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
  
    const result = deleteCart(productId,userId,storeId);
    t.true(result.success);
    t.is(result.message, "Ürün sepetten çıkarıldı.");
  })
  test('Sepette olmayan ürün çıkarılmaya çalışıldığında hata döner', t => {
    const userId = ulid();
    const productId = ulid();
    const storeId=ulid()
    const initialDB={
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
        items:[{productId:productId,quantity:3}]}],
  
      orders:[],

      stores: [{
        id: storeId,
        name: "Mağaza 1",
        location: { latitude: 0, longitude: 0 },
        products: [{ productId: productId, quantity: 10 }]
        }]


    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    const fakeProductId = ulid();
  
    const result = deleteCart(fakeProductId ,userId,storeId);
  
    t.false(result.success);
    t.is(result.message, "Ürün bulunamadı");
  });

  //PRODUCT TESTLERİ
  test('Ürün başarıyla ekleniyor mu?', t => {
    const newProduct = {
      name: "Defter",
      price: 25,
      stock: { value: 50, reserve: 0 }
    };
    const result = addProduct(newProduct);
    t.true(result.success);
    t.is(result.message, "Ürün başarıyla eklendi");
  })

  //ORDER TESTLERİ
  test('Başarılı sipariş oluşturma', t => {
    const userId = ulid();
    const productId = ulid();
    const storeId=ulid()
    const quantity = 3;

    const initialDB = {
      users: [{
        id: userId,
        name: "İrem",
        surname: "Ormancı",
        phone: "5524616059",
        email: "iremxx@gmail.com"
      }],
      products: [{
        id: productId,
        name: "Kalem",
        price: 10,
        stock: { value: 10, reserve: 3 }
      }],
      carts: [{
        userId,
        items: [{ productId, quantity}]
      }],
      orders: [],
      stores: [{
        id: storeId,
        name: "Mağaza 1",
        location: { latitude: 0, longitude: 0 },
        products: [{ productId: productId, quantity: 10 }]
        }]
      
    };
  
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    const product = initialDB.products[0];
    const total=product.price * quantity

    const result = addOrder({
      userId,
      items: [{ productId, quantity: 3}],
      createdAt: new Date().toISOString(),
      stores:initialDB.stores
    });
    t.true(result.success);
    t.is(result.message, "Sipariş başarıyla oluşturuldu");

  const db = readDB();

  // Sepetin boşaldığını kontrol et
  const cart = db.carts.find(c => c.userId === userId);
  t.truthy(cart);
  t.is(cart!.items.length, 0);

  // Stok değerlerinin doğru azaldığını kontrol et
  const updatedProduct = db.products.find(p => p.id === productId);
  t.truthy(updatedProduct);
  t.is(updatedProduct!.stock.value, 7);    // 10 - 3 = 7 olmalı
  t.is(updatedProduct!.stock.reserve, 0);  // 3 - 3 = 0 olmalı
});
test('Yakın mağazada stok yoksa, uzak mağazadan sipariş oluşturuluyor', t => {
  const userId=ulid()
  const productId=ulid()
  const user: User = {
    id: userId,
        name: "İrem",
        surname: "Ormancı",
        phone: "5524616059",
        email: "iremxx@gmail.com",
      location: { latitude: 0, longitude: 0 }
  };

  const nearStore: Store = {
    id: ulid(),
    name: 'Yakın Mağaza',
    location: { latitude: 0.1, longitude: 0.1 },
    products: [{ productId:productId, quantity: 10 }],
  };

  const farStore: Store = {
    id: ulid(),
    name: 'Uzak Mağaza',
    location: { latitude: 2, longitude: 2 },
    products: [{ productId: productId, quantity: 10 }],
  };

  const product: Product = {
    id: productId,
    name: 'Atkı',
    price: 100,
    stock: { value: 10, reserve: 0 }
  };

  const result = addOrder({
    userId: user.id,
    items: [{ productId: product.id, quantity: 1 }],
    createdAt: new Date().toISOString(),
    stores: [nearStore, farStore]
  });
  

  t.true(result.success);
  t.is(result.order?.storeId, farStore.id);
});
