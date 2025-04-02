Warehouse Management

Overview

Warehouse Management is a web-based application designed to manage inventory, track stock movements, and generate reports for better warehouse operations. The system provides essential features for product management, order tracking, and analytics.

Technology Stack

Frontend: React, JavaScript

Backend: XAMPP, MySQL

Packages Used:

In Warehouse-Management directory: npm i

In warehouse-backend directory:

npm i multer

npm install sequelize mysql2

Features

1. Reporting & Analytics

Inventory Reports: View current stock levels.

Import-Export Reports: Track the history of imported and exported goods.

Revenue & Profit Reports: Analyze sales performance.

Stock Alerts: Receive notifications for low or excessive stock levels.

2. Product Management

Add Products: Enter new product details (ID, name, description, quantity, price, supplier).

Edit Products: Update product details when changes occur.

Delete Products: Remove products from the system when necessary.

Search & Filter Products: Find products by ID, name, category, supplier, etc.

3. Warehouse Management

Check Inventory: View current stock levels per product.

Import Stock: Record new stock from suppliers or production.

Export Stock: Track stock movement for sales, transfers, or returns.

Adjust Stock: Update inventory levels after stocktaking.

4. Order & Transaction Management

Create Import Orders: Record stock purchases from suppliers.

Create Export Orders: Track stock distribution to customers.

Order Status Tracking: Monitor order progress (Completed, Processing).

Installation & Setup

Prerequisites

Node.js and npm installed

XAMPP installed (for MySQL database)

Steps to Run the Project

Backend Setup

1. Navigate to the backend directory:
cd warehouse-backend
2. Install dependencies:
npm install multer sequelize mysql2
3. Start XAMPP
Start Apache and MySQL
4. Start the backend server (ensure MySQL is running in XAMPP):
node server.js

Frontend Setup
1. Navigate to the frontend directory:
cd Warehouse-Management
2. Install dependencies:
npm install
3. Start the React application:
npm start
