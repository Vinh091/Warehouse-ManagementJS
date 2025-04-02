import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../styles/OrderStatus.css";

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

  const handleCompleteOrder = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'Hoàn thành' } : order
      )
    );
    alert("Đơn hàng đã được đánh dấu là Hoàn thành");
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối đơn hàng này?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${orderId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Lỗi khi xóa đơn hàng");
      alert("Đơn hàng đã bị từ chối và xóa");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'badge bg-success rounded-pill';
      case 'Đang xử lý':
        return 'badge bg-warning text-dark rounded-pill';
      default:
        return 'badge bg-secondary rounded-pill';
    }
  };

  const getOrderTypeIcon = (type) => {
    return type === 'import' 
      ? <i className="bi bi-box-arrow-in-down text-primary me-2"></i> 
      : <i className="bi bi-box-arrow-up text-danger me-2"></i>;
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 text-primary">
              <i className="bi bi-clipboard-check me-2"></i>
              Theo dõi tình trạng đơn hàng
            </h4>
            <button 
              className="btn btn-outline-primary" 
              onClick={fetchOrders}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Làm mới
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="alert alert-info d-flex align-items-center">
              <i className="bi bi-info-circle-fill me-2"></i>
              <div>Không có đơn hàng nào</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr className="table-light">
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
                    <tr 
                      key={order.id} 
                      className={order.type === 'import' ? 'import-row' : 'export-row'}
                      style={{ cursor: "pointer", transition: "0.3s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e9ecef"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                    >
                      <td>
                        {getOrderTypeIcon(order.type)}
                        <span>{order.type === 'import' ? 'Đơn nhập hàng' : 'Đơn xuất hàng'}</span>
                      </td>
                      <td className="fw-medium">{order.productId?.name || 'N/A'}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {order.quantity}
                        </span>
                      </td>
                      <td>
                        <div>{new Date(order.date).toLocaleDateString()}</div>
                        <small className="text-muted">{new Date(order.date).toLocaleTimeString()}</small>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button 
                            className="btn btn-outline-success btn-sm" 
                            onClick={() => handleCompleteOrder(order.id)}
                            disabled={order.status === 'Hoàn thành'}
                            title="Đánh dấu hoàn thành"
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            Hoàn thành
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm" 
                            onClick={() => handleRejectOrder(order.id)}
                            title="Từ chối đơn hàng"
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="card-footer bg-white border-top py-3">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">Tổng số đơn hàng: {orders.length}</small>
            <div>
              <small className="me-3">
                <span className="badge bg-warning text-dark me-1">Đang xử lý</span>
                {orders.filter(order => order.status === 'Đang xử lý').length}
              </small>
              <small>
                <span className="badge bg-success me-1">Hoàn thành</span>
                {orders.filter(order => order.status === 'Hoàn thành').length}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;