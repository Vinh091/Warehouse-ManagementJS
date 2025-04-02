import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import { 
  FaChartBar, FaBox, FaClipboardList, FaShoppingCart, 
  FaUsers, FaWarehouse,  FaSignOutAlt 
} from "react-icons/fa";

const HomePage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showReports, setShowReports] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="homepage-container">
      <aside className="sidebar">
        <h1 className="title">📦 Warehouse Management</h1>
        <nav className="menu">
          <div className="menu-item" onClick={() => setShowReports(!showReports)}>
            <FaChartBar /> Báo cáo & Phân tích 
          </div>
          <div className="menu-item" onClick={() => navigate("/product-management")}> 
            <FaBox /> Quản lý sản phẩm 
          </div>
          <div className="menu-item" onClick={() => navigate("/warehouse-management")}> 
            <FaClipboardList /> Quản lý kho hàng 
          </div>
          <div className="menu-item" onClick={() => navigate("/orders-management")}> 
            <FaShoppingCart /> Quản lý đơn hàng & giao dịch 
          </div>
          <div className="menu-item" onClick={() => navigate("/supplier-customer-management")}> 
            <FaUsers /> Quản lý nhà cung cấp & khách hàng 
          </div>
          <div className="menu-item" onClick={() => navigate("/inventory-maintenance")}> 
            <FaWarehouse /> Kiểm kê & bảo trì kho 
          </div>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Đăng xuất
        </button>
      </aside>
    </div>
  );
};

export default HomePage;
