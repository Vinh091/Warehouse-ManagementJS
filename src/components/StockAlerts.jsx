import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";

const StockAlerts = () => {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Lấy dữ liệu từ API
  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const newAlerts = products.filter(
      (product) => product.quantity <= product.minThreshold || product.quantity >= product.maxThreshold
    );
    setAlerts(newAlerts);
  }, [products]);

  return (
    <div className="stock-alerts-container">
      <h2>Cảnh báo số lượng sản phẩm</h2>
      {alerts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng hiện tại</th>
              <th>Ngưỡng tối thiểu</th>
              <th>Ngưỡng tối đa</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <tr key={index} className={alert.quantity <= alert.minThreshold ? "critical" : "warning"}>
                <td>{alert.name}</td>
                <td>{alert.quantity}</td>
                <td>{alert.minThreshold}</td>
                <td>{alert.maxThreshold}</td>
                <td>
                  {alert.quantity <= alert.minThreshold ? (
                    <span className="low-stock">Cần nhập hàng</span>
                  ) : (
                    <span className="over-stock">Vượt ngưỡng tối đa</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-alerts">Không có sản phẩm nào cần cảnh báo.</p>
      )}
    </div>
  );
};

export default StockAlerts;
