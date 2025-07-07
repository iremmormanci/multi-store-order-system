# Multi-Store Order System

A TypeScript application that enables users to add products to a cart and place orders from multiple stores based on product availability and store proximity. It handles stock reservation, ensures all items in an order come from the same store, and updates inventory accordingly. The data is persisted in a JSON file acting as a mock database.

## 🚀 Features

- User registration with location data.
- Add products to cart with stock reservation.
- Find the nearest store that can fulfill all items in the cart.
- Create orders ensuring all products come from the same store.
- Update product stock and clear cart after order placement.
- Remove items from cart and update reserved stock.
- Distance calculations to select appropriate stores.
- Persistence using a JSON file for easy data management.
- Comprehensive unit tests with AVA framework.

## 🛠 Technologies

- TypeScript
- Node.js
- geolib (for geographic distance calculations)
- ulid (for unique IDs)
- AVA (for testing)
- fs module (for file-based persistence)

## 📂 Project Structure

src/
├── cartRules.ts # Cart management logic (add, remove)
├── orderRules.ts # Order creation and processing
├── productRules.ts # Product management
├── storeRules.ts # Store selection and distance calculations
├── userRules.ts # User registration and validation
├── type.ts # TypeScript type definitions
├── mockData.ts # Sample/mock database data
└── index.ts # Main entry point (if any)
db.json # Mock database file
tests/ # AVA test files

## 🚚 Order Flow

1. User registers with location info.
2. User adds products to their cart; stock is reserved.
3. On order creation, system finds a single store that can fulfill all products.
4. Stock values and reservations are updated accordingly.
5. Cart is cleared after successful order.
6. Orders are saved to `db.json`.

## 🔧 How to Run

1. Clone the repo.
2. Run `npm install` to install dependencies.
3. Run tests with `npm test`.
4. Use the exported functions in your app or extend as needed.
