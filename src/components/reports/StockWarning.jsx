import { useEffect, useState } from "react";
import "../../styles/StockWarning.css"; // ✅ Thêm CSS riêng

const StockWarning = () => {
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/stock-warning")
      .then((res) => res.json())
      .then((data) => setWarnings(data))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu cảnh báo:", err));
  }, []);

  return (
    <div className="stock-warning-container">
      <h2 className="warning-title">⚠️ Cảnh Báo Tồn Kho</h2>
      {warnings.length === 0 ? (
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
                key={item._id}
                className={
                  item.quantity === 0
                    ? "out-of-stock"
                    : item.quantity <= item.minThreshold
                    ? "low-stock"
                    : ""
                }
              >
                <td>{item.name}</td>
                <td>{item.quantity} cái</td>
                <td>{item.minThreshold} cái</td>
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
