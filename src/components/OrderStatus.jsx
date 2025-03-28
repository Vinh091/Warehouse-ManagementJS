import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/import-export-report');
      if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu đơn hàng');
      const data = await response.json();
      // Gán trạng thái mặc định "Đang xử lý" cho đơn hàng
      const ordersWithStatus = data.map(order => ({
        ...order,
        status: 'Đang xử lý'
      }));
      setOrders(ordersWithStatus);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Xử lý cập nhật trạng thái "Hoàn thành" cục bộ
  const handleCompleteOrder = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId ? { ...order, status: 'Hoàn thành' } : order
      )
    );
    alert("Đơn hàng đã được đánh dấu là Hoàn thành");
  };

  // Xử lý "Từ chối" (xóa đơn hàng)
  const handleRejectOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối đơn hàng này?")) return;
    try {
      // Gọi API DELETE (đảm bảo endpoint này đã được triển khai trên server)
      const response = await fetch(`http://localhost:5000/api/transactions/${orderId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Lỗi khi xóa đơn hàng");
      alert("Đơn hàng đã bị từ chối và xóa");
      // Làm mới danh sách đơn hàng
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Theo dõi tình trạng đơn hàng</h2>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Loại đơn</th>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.type === 'import' ? 'Đơn nhập hàng' : 'Đơn xuất hàng'}</td>
                  <td>{order.productId?.name || 'N/A'}</td>
                  <td>{order.quantity}</td>
                  <td>{new Date(order.date).toLocaleString()}</td>
                  <td>{order.status}</td>
                  <td className="text-center">
                    <button 
                      className="btn btn-success btn-sm me-2" 
                      onClick={() => handleCompleteOrder(order._id)}
                    >
                      Hoàn thành
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleRejectOrder(order._id)}
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;
