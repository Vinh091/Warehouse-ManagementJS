import React, { useEffect, useState } from "react";
import "../../styles/ImportExportReport.css";

const ImportExportReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "import", "export"
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/import-export-report");
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu nhập xuất");
        }
        const data = await res.json();
        console.log("📊 Dữ liệu giao dịch nhận được từ API:", data); // Log dữ liệu trả về
        setTransactions(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchTransactions();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filter transactions based on current filter
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type (import/export)
    if (filter !== "all" && transaction.type !== filter) {
      return false;
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59); // Set to end of day
      
      if (transactionDate < startDate || transactionDate > endDate) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate statistics
  const totalImported = filteredTransactions
    .filter(t => t.type === "import")
    .reduce((sum, t) => sum + t.quantity, 0);
    
  const totalExported = filteredTransactions
    .filter(t => t.type === "export")
    .reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="import-export-report-container">
      <h2 className="report-title">Báo cáo nhập - xuất - tồn</h2>
      
      {loading ? (
        <p className="loading-text">Đang tải dữ liệu...</p>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <p className="error-help">Kiểm tra kết nối đến server và đảm bảo API đang hoạt động.</p>
        </div>
      ) : (
        <>
          <div className="filter-controls">
            <div className="filter-group">
              <label>Loại giao dịch:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="import">Nhập kho</option>
                <option value="export">Xuất kho</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Từ ngày:</label>
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="date-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Đến ngày:</label>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="date-input"
              />
            </div>
          </div>
          
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-title">Tổng nhập kho</div>
              <div className="summary-value">{totalImported.toLocaleString()}</div>
              <div className="summary-icon import-icon">↓</div>
            </div>
            
            <div className="summary-card">
              <div className="summary-title">Tổng xuất kho</div>
              <div className="summary-value">{totalExported.toLocaleString()}</div>
              <div className="summary-icon export-icon">↑</div>
            </div>
            
            <div className="summary-card">
              <div className="summary-title">Chênh lệch</div>
              <div className="summary-value">{(totalImported - totalExported).toLocaleString()}</div>
              <div className="summary-icon">=</div>
            </div>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <p className="no-data-message">Không có dữ liệu giao dịch cho bộ lọc hiện tại.</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Mã sản phẩm</th>
                  <th>Tên sản phẩm</th>
                  <th>Loại giao dịch</th>
                  <th>Số lượng</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className={transaction.type === "import" ? "import-row" : "export-row"}>
                    <td>{transaction.productId?.code || "N/A"}</td>
                    <td>{transaction.productId?.name || "Sản phẩm không xác định"}</td>
                    <td>
                      <span className={`transaction-type ${transaction.type}`}>
                        {transaction.type === "import" ? "Nhập kho" : "Xuất kho"}
                      </span>
                    </td>
                    <td className="quantity-cell">{transaction.quantity}</td>
                    <td>{formatDate(transaction.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default ImportExportReport;