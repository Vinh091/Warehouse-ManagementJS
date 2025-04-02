import React, { useEffect, useState } from "react";
import "../../styles/StockReport.css";

const StockReport = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stock-report");
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu tồn kho");
        }
        const data = await res.json();
        console.log("📊 Dữ liệu tồn kho nhận được từ API:", data);
    
        // Tính toán tổng số lượng và tổng giá trị
        const totalItems = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalValue = data.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
    
        setStockData(data);
        setTotalItems(totalItems);
        setTotalValue(totalValue);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="stock-report-container">
      <h2 className="stock-report-title">Báo cáo tồn kho</h2>

      {loading ? (
        <p className="loading-text">Đang tải dữ liệu...</p>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <p className="error-help">Kiểm tra kết nối đến MySQL và đảm bảo server backend đang chạy.</p>
        </div>
      ) : stockData.length === 0 ? (
        <p className="no-data-message">Không có dữ liệu tồn kho.</p>
      ) : (
        <>
          <div className="stock-summary">
            <div className="summary-item">
              <span className="summary-label">Tổng số mặt hàng:</span>
              <span className="summary-value">{stockData.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tổng số lượng:</span>
              <span className="summary-value">{totalItems.toLocaleString()} cái</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tổng giá trị:</span>
              <span className="summary-value">{totalValue.toLocaleString()} VND</span>
            </div>
          </div>

          <table className="stock-table">
            <thead>
              <tr>
                <th>Mã sản phẩm</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Giá trị</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item) => (
                <tr key={item.id} className={item.quantity < (item.minThreshold || 10) ? "low-stock" : ""}>
                  <td>{item.code || "N/A"}</td>
                  <td>{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{item.price?.toLocaleString()} VND</td>
                  <td className="text-right">{(item.quantity * item.price)?.toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default StockReport;
