import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./components/Dashboard";
import Login from "./Login_Res/Login";
import StockReport from "./components/reports/StockReport";
import ImportExportReport from "./components/reports/ImportExportReport";
import RevenueReport from "./components/reports/RevenueReport";
import StockWarning from "./components/reports/StockWarning";
import EditProduct from "./components/ProductManagement/EditProduct";
import ProductManagement from "./components/ProductManagement/ProductManagement";
import InventoryAdjust from "./components/InventoryAdjust";
import InventoryImport from "./components/InventoryImport";
import InventoryExport from "./components/InventoryExport";
import InventoryList from "./components/InventoryList";
import OrderImport from "./components/OrderImport";
import OrderExport from "./components/OrderExport";
import OrderStatus from "./components/OrderStatus";
function App() {
  const [salesData, setSalesData] = useState([]);
  const [products, setProducts] = useState([]);
  

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  
  const loginUser = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };
  
  const logoutUser = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };
  

  // Fetch dữ liệu sales
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const res = await fetch("http://localhost:5000/sales");
        const data = await res.json();
        setSalesData(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sales:", error);
      }
    };
    fetchSalesData();
  }, []);

  // Fetch dữ liệu products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/products");
        if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
        const data = await res.json();
        console.log("Dữ liệu từ API:", data); // 🔍 Kiểm tra dữ liệu nhận được
        setProducts(data); 
        
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);
  
  const addProduct = (newProduct) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const updateProductImage = async (req, res) => {
    const { productId } = req.params; // Lấy ID sản phẩm
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Lấy URL ảnh đã upload

    if (!imageUrl) return res.status(400).json({ message: "No image uploaded" });

    await Product.findByIdAndUpdate(productId, { image: imageUrl });
    res.json({ message: "Image updated successfully", imageUrl });
};

  const updateProduct = async (id, updatedProduct) => {
    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });
  
      if (!res.ok) throw new Error("Cập nhật sản phẩm thất bại");
  
      const updatedData = await res.json();
  
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...updatedData, _id: id } : product
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    }
  };
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Layout onLogout={logoutUser} /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Báo cáo & Phân tích */}
          <Route path="stock-report" element={<StockReport products={products} />} />
          <Route path="ImportExportReport" element={<ImportExportReport />} />
          <Route path="RevenueReport" element={<RevenueReport />} />
          <Route path="StockWarning" element={<StockWarning />} />
          
          {/* Quản lý sản phẩm */}
          <Route path="products" element={<ProductManagement />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />

          {/* Quản lý kho hàng */}
          <Route path="inventoryadjust" element={<InventoryAdjust />} />
          <Route path="inventoryimport" element={<InventoryImport />} />
          <Route path="inventoryexport" element={<InventoryExport />} />
          <Route path="inventorylist" element={<InventoryList />} />

          {/* Quản lý đơn hàng */}
          <Route path="orderimport" element={<OrderImport />} />
          <Route path="orderexport" element={<OrderExport />} />
          <Route path="orderstatus" element={<OrderStatus />} />

        </Route>
        
        <Route path="/login" element={<Login loginUser={loginUser} />} />
      </Routes>
    </Router>
  );
}

export default App;