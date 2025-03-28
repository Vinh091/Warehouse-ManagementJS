import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FaChartBar, FaBox, FaClipboardList, FaCubes, FaShoppingCart, FaUsers, FaWarehouse, FaSignOutAlt } from "react-icons/fa";
import "./styles/HomePage.css";

const Layout = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="homepage-container">
      <aside className="sidebar">
        <h1 className="title">📦 Warehouse Management</h1>
        <nav className="menu">
          <div className="menu-item" onClick={() => navigate("/dashboard")}> <FaChartBar /> Dashboard </div>
          
          {/* Báo cáo & Phân tích */}
          <div className="menu-item" onClick={() => setIsReportOpen(!isReportOpen)}>
            <FaClipboardList /> Báo cáo & Phân tích
          </div>
            {isReportOpen && (
              <div className="submenu">
              <div className="submenu-item" onClick={() => navigate("/stock-report")}>📦 Báo cáo tồn kho</div>
              <div className="submenu-item" onClick={() => navigate("/ImportExportReport")}>📑 Báo cáo nhập - xuất - tồn</div>
              <div className="submenu-item" onClick={() => navigate("/RevenueReport")}>💰 Báo cáo doanh thu/lợi nhuận</div>
              <div className="submenu-item" onClick={() => navigate("/StockWarning")}>⚠️ Cảnh báo tồn kho</div>
          </div>
        )}


          {/* Quản lý sản phẩm */}
          <div className="menu-item" onClick={() => navigate("/products")}>
            <FaBox /> Quản lý sản phẩm
          </div>

        {/* Quản lý kho hàng */}
          <div className="menu-item" onClick={() => setIsStockOpen(!isStockOpen)}>
            <FaWarehouse /> Quản lý kho hàng
          </div>
            {isStockOpen && (
              <div className="submenu">
              <div className="submenu-item" onClick={() => navigate("/inventorylist")}>📦 Kiểm tra tồn kho</div>
              <div className="submenu-item" onClick={() => navigate("/inventoryimport")}>📥 Nhập kho</div>
              <div className="submenu-item" onClick={() => navigate("/inventoryexport")}>📤 Xuất kho</div>
              <div className="submenu-item" onClick={() => navigate("/inventoryadjust")}>⚙️ Điều chỉnh kho</div>
          </div>
        )}

        {/* Quản lý đơn hàng */}
          <div className="menu-item" onClick={() => setIsOrderOpen(!isOrderOpen)}>
            <FaShoppingCart /> Quản lý đơn hàng
          </div>
            {isOrderOpen && (
              <div className="submenu">
              <div className="submenu-item" onClick={() => navigate("/orderimport")}>📝 Tạo đơn nhập hàng</div>
              <div className="submenu-item" onClick={() => navigate("/orderexport")}>📦 Tạo đơn xuất hàng</div>
              <div className="submenu-item" onClick={() => navigate("/orderstatus")}>🔍 Theo dõi tình trạng đơn hàng</div>
          </div>
        )}

        {/* Nhà cung cấp & Khách hàng */}
          <div className="menu-item" onClick={() => setIsSupplierOpen(!isSupplierOpen)}>
            <FaUsers /> Nhà cung cấp & Khách hàng
          </div>
            {isSupplierOpen && (
              <div className="submenu">
              <div className="submenu-item" onClick={() => navigate("/ManageSuppliers")}>🏢 Quản lý nhà cung cấp</div>
              <div className="submenu-item" onClick={() => navigate("/ManageCustomers")}>👥 Quản lý khách hàng</div>
              <div className="submenu-item" onClick={() => navigate("/TransactionHistory")}>📜 Lịch sử giao dịch</div>
          </div>
        )}
        </nav>
        <button className="logout-btn" onClick={handleLogout}> <FaSignOutAlt /> Đăng xuất </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;