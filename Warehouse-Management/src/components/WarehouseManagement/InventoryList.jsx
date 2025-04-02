import { useEffect, useState } from "react";

const InventoryList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm lấy danh sách sản phẩm từ API
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/products");
      if (!res.ok) {
        throw new Error("Không thể tải dữ liệu sản phẩm");
      }
      const data = await res.json();
      console.log("📊 Dữ liệu sản phẩm nhận được từ API:", data);
      
      // Sắp xếp sản phẩm theo id nếu cần
      const sortedData = [...data].sort((a, b) => {
        // Nếu id là số thì so sánh theo số, nếu là chuỗi thì so sánh theo chuỗi
        return a.id > b.id ? 1 : -1;
      });
      
      setProducts(sortedData);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
      setError("Không thể tải dữ liệu sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-lg text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 mx-auto max-w-6xl">
        <strong className="font-bold">Lỗi!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Danh sách sản phẩm</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-lg">
            Không có sản phẩm nào trong kho
          </div>
        ) : (
          <div className="overflow-x-auto p-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Mã sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  {products[0]?.price !== undefined && (
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-500">{product.quantity}</div>
                    </td>
                    {product.price !== undefined && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-500">{formatCurrency(product.price)}</div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-right">
        <button 
          onClick={fetchProducts} 
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-auto shadow"
          title="Làm mới"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InventoryList; 