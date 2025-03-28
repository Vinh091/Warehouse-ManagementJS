import { useEffect, useState } from "react";

const InventoryList = () => {
  const [products, setProducts] = useState([]);

  // Hàm lấy danh sách sản phẩm từ API
  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();
    setProducts(data);
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm thêm sản phẩm
  const addProduct = async () => {
    const newProduct = { name: "Sản phẩm mới", quantity: 10 };
    await fetch("http://localhost:5000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    // Gọi lại fetchProducts để cập nhật danh sách từ DB
    fetchProducts();
  };

  return (
    <div>
      <h2>Danh sách sản phẩm</h2>
      <button onClick={addProduct}>Thêm sản phẩm</button>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            {product.name} - {product.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;
