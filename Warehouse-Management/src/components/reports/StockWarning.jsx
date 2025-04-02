import { useEffect, useState } from "react";
import "../../styles/StockWarning.css";

const StockWarning = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy tất cả sản phẩm
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => {
        // Lọc sản phẩm dưới ngưỡng tồn kho hoặc có minThreshold null nhưng quantity = 0
        const warningItems = data.filter(item => 
          (item.minThreshold !== null && item.quantity < item.minThreshold) || 
          (item.minThreshold === null && item.quantity === 0)
        );
        setWarnings(warningItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu cảnh báo:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="stock-warning-container">
      <h2 className="warning-title">⚠️ Cảnh Báo Tồn Kho</h2>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : warnings.length === 0 ? (
        <p className="no-warning">✅ Tất cả sản phẩm đều đủ hàng.</p>
      ) : (
        <table className="warning-table">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Ngưỡng tối thiểu</th>
              <th>Mức độ</th>
            </tr>
          </thead>
          <tbody>
            {warnings.map((item) => (
              <tr
                key={item.id}
                className={
                  item.quantity === 0
                    ? "out-of-stock"
                    : "low-stock"
                }
              >
                <td>{item.name}</td>
                <td>{item.quantity} cái</td>
                <td>{item.minThreshold !== null ? `${item.minThreshold} cái` : 'Chưa thiết lập'}</td>
                <td>
                  {item.quantity === 0 ? "Hết hàng ❌" : "Sắp hết ⏳"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockWarning;