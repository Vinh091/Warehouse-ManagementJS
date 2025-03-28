import { useEffect, useState } from "react";
import "../../styles/RevenueReport.css";

const RevenueReport = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [dateRange, setDateRange] = useState("all"); // "all", "week", "month"

  // Hàm gọi API để lấy dữ liệu doanh thu
  const fetchRevenueData = () => {
    fetch("http://localhost:5000/api/revenue-report")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Lỗi khi lấy dữ liệu");
        }
        return res.json();
      })
      .then((data) => {
        console.log("📊 Dữ liệu doanh thu nhận được từ API:", data); // Log dữ liệu trả về
  
        // Sắp xếp dữ liệu theo ngày (mới nhất lên đầu)
        const sortedData = [...data].sort((a, b) => {
          return new Date(b._id) - new Date(a._id);
        });
  
        setRevenueData(sortedData);
  
        // Tính toán tổng doanh thu và đơn hàng
        const total = sortedData.reduce((sum, item) => sum + item.totalRevenue, 0);
        const orders = sortedData.reduce((sum, item) => sum + item.totalOrders, 0);
  
        setTotalRevenue(total);
        setTotalOrders(orders);
        setAverageOrderValue(orders > 0 ? total / orders : 0);
  
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", err);
        setError("Không thể tải dữ liệu báo cáo doanh thu.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRevenueData(); // Gọi API lần đầu

    // Đặt interval để gọi API mỗi 30 giây
    const intervalId = setInterval(fetchRevenueData, 30000);

    // Cleanup function để tránh memory leak khi component bị unmount
    return () => clearInterval(intervalId);
  }, []);

  // Lọc dữ liệu theo khoảng thời gian
  const filteredData = () => {
    if (dateRange === "all") return revenueData;
  
    const today = new Date();
    let filterDate = new Date();
  
    if (dateRange === "week") {
      // 7 ngày trước
      filterDate.setDate(today.getDate() - 7);
    } else if (dateRange === "month") {
      // 30 ngày trước
      filterDate.setDate(today.getDate() - 30);
    }
  
    return revenueData.filter(item => new Date(item._id) >= filterDate);
  };

  // Tính toán số liệu dựa trên dữ liệu được lọc
  useEffect(() => {
    const filtered = filteredData();
    const total = filtered.reduce((sum, item) => sum + item.totalRevenue, 0);
    const orders = filtered.reduce((sum, item) => sum + item.totalOrders, 0);
    
    setTotalRevenue(total);
    setTotalOrders(orders);
    setAverageOrderValue(orders > 0 ? total / orders : 0);
  }, [dateRange, revenueData]);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div> Đang tải dữ liệu...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="revenue-report-container">
      <div className="report-header">
        <h2>Báo cáo doanh thu</h2>
        <div className="action-buttons">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-filter"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="week">7 ngày gần đây</option>
            <option value="month">30 ngày gần đây</option>
          </select>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Tổng doanh thu</h3>
          <p className="summary-value">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="summary-card">
          <h3>Tổng đơn hàng</h3>
          <p className="summary-value">{totalOrders}</p>
        </div>
      </div>

      {filteredData().length === 0 ? (
        <div className="no-data">Không có dữ liệu doanh thu trong khoảng thời gian đã chọn</div>
      ) : (
        <div className="revenue-table-container">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Doanh thu</th>
                <th>Số lượng đơn</th>
              </tr>
            </thead>
            <tbody>
              {filteredData().map((item, index) => {
                const avgValue = item.totalOrders > 0 ? item.totalRevenue / item.totalOrders : 0;
                return (
                  <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                    <td>{new Date(item._id).toLocaleDateString('vi-VN')}</td>
                    <td className="amount-cell">{formatCurrency(item.totalRevenue)}</td>
                    <td className="center-cell">{item.totalOrders}</td>               
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RevenueReport;