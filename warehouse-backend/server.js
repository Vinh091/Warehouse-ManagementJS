require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Kết nối MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });

  // Cấu hình Multer (Upload ảnh)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Cho phép truy cập thư mục chứa ảnh
app.use("/uploads", express.static("uploads"));

// API Upload ảnh
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Không có file nào được tải lên" });
  res.json({ imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}` });
});

// Model sản phẩm
const Product = mongoose.model("Product", new mongoose.Schema({
  code: String,
  name: String,
  description: String,
  quantity: Number,
  price: Number,
  supplier: String,
  minThreshold: Number,
  image: String,
  createdAt: { type: Date, default: Date.now },
}));

// 📌 Schema cho doanh số bán hàng
const salesSchema = new mongoose.Schema({
  date: String,
  seller: String,
  amount: Number,
});
const Sale = mongoose.model("Sale", salesSchema);

// Model đơn hàng (Order)
const Order = mongoose.model("Order", new mongoose.Schema({
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
}));

// Model nhập hàng (Import)
const Import = mongoose.model("Import", new mongoose.Schema({
  totalCost: { type: Number, required: true },
  importDate: { type: Date, default: Date.now },
}));

 
// Model giao dịch nhập/xuất kho
const Transaction = mongoose.model("Transaction", new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  type: { type: String, enum: ["import", "export"], required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}));

// 📌 Schema cho quản lý kho hàng (Inventory)
const inventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});
const Inventory = mongoose.model("Inventory", inventorySchema);

// --------------------- Các API hiện có -----------------------

// 📌 API: Lấy danh sách sản phẩm
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
  }
});

// API thêm sản phẩm
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { code, name, description, quantity, price, supplier, minThreshold } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newProduct = new Product({
      code, name, description, quantity, price, supplier, minThreshold, image
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: "Lỗi khi thêm sản phẩm", details: error.message });
  }
});

// API tìm kiếm sản phẩm
app.get("/products/search", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Vui lòng nhập tên sản phẩm để tìm kiếm" });
    }
    const results = await Product.find({ name: new RegExp(name, "i") });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tìm kiếm sản phẩm" });
  }
});


// 📌 API: Thêm sản phẩm mới
app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json(newProduct);
});

// 📌 API: Cập nhật sản phẩm
app.put("/products/:id", async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedProduct);
});

// 📌 API: Xóa sản phẩm
app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Sản phẩm đã bị xóa" });
});

// 📌 API: Lấy danh sách doanh số bán hàng
app.get("/sales", async (req, res) => {
  const sales = await Sale.find();
  res.json(sales);
});

// 📌 API: Thêm dữ liệu doanh số bán hàng
app.post("/sales", async (req, res) => {
  const newSale = new Sale(req.body);
  await newSale.save();
  res.json(newSale);
});

// 📌 API: Xóa doanh số bán hàng
app.delete("/sales/:id", async (req, res) => {
  await Sale.findByIdAndDelete(req.params.id);
  res.json({ message: "Giao dịch bán hàng đã bị xóa" });
});

// API: Lấy dữ liệu tồn kho từ collection Product
app.get("/api/stock-report", async (req, res) => {
  try {
    const stockReport = await Product.find({}, "code name quantity price minThreshold");
    console.log("Dữ liệu tồn kho từ backend:", stockReport); // Log dữ liệu trả về
    res.json(stockReport);
  } catch (error) {
    console.error("Error fetching stock report:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu tồn kho" });
  }
});


// 📌 API: Lấy dữ liệu nhập xuất kho
app.get("/api/import-export-report", async (req, res) => {
  try {
    const report = await Transaction.find().populate("productId", "code name");
    console.log("Import-Export Report:", report); // Log dữ liệu giao dịch
    res.json(report);
  } catch (error) {
    console.error("Error fetching import-export report:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu nhập xuất" });
  }
});

// 📌 API: Lấy dữ liệu doanh thu
app.get("/api/revenue-report", async (req, res) => {
  try {
    console.log("📊 Bắt đầu lấy dữ liệu doanh thu...");

    const revenueReport = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    console.log("📊 Dữ liệu doanh thu:", revenueReport);

    // Thêm kiểm tra và xử lý khi không có dữ liệu
    if (revenueReport.length === 0) {
      return res.status(404).json({ message: "Không có dữ liệu doanh thu" });
    }

    res.json(revenueReport);
  } catch (err) {
    console.error("❌ Lỗi khi lấy dữ liệu doanh thu:", err);
    res.status(500).json({ 
      error: "Lỗi server khi lấy dữ liệu báo cáo doanh thu",
      details: err.message 
    });
  }
});



// 📌 API: Lấy dữ liệu cảnh báo tồn kho
app.get("/api/stock-warning", async (req, res) => {
  try {
    const lowStockItems = await Product.find({ $expr: { $lt: ["$quantity", "$minThreshold"] } });
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu cảnh báo tồn kho" });
  }
});

// 📌 API: Tìm kiếm & lọc sản phẩm theo tên hoặc nhà cung cấp
app.get("/products/search", async (req, res) => {
  const { name } = req.query;
  const query = {};

  if (name && name.trim() !== "") {
    query.name = new RegExp(name, "i"); // Không phân biệt hoa thường
  }

  try {
    const results = await Product.find(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tìm kiếm sản phẩm" });
  }
});

// --------------------- Các API Quản lý kho hàng -----------------------

// 📌 API: Kiểm tra tồn kho (lấy danh sách các bản ghi trong Inventory)
app.get("/api/inventory", async (req, res) => {
  try {
    const inventoryList = await Inventory.find().populate("productId", "name");
    res.json(inventoryList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 API: Nhập kho (ghi nhận hàng nhập vào kho)
app.post("/api/inventory/nhap", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Tìm sản phẩm trong kho
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }

    // Cập nhật số lượng sản phẩm
    product.quantity += quantity; // Tăng số lượng sản phẩm
    await product.save(); // Lưu thay đổi vào database

    res.json({ message: "Nhập kho thành công", product });
  } catch (err) {
    console.error("Error during import:", err);
    res.status(500).json({ error: "Lỗi khi nhập kho" });
  }
});

// 📌 API: Xuất kho (ghi nhận hàng xuất kho)
app.post("/api/inventory/xuat", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Tìm sản phẩm trong kho
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra số lượng tồn kho
    if (product.quantity < quantity) {
      return res.status(400).json({ error: "Số lượng tồn kho không đủ" });
    }

    // Cập nhật số lượng sản phẩm
    product.quantity -= quantity;
    await product.save();

    // Ghi nhận giao dịch xuất kho
    const transaction = new Transaction({
      productId: product._id,
      type: "export",
      quantity,
      date: new Date(),
    });
    await transaction.save();

    res.json({ message: "Xuất kho thành công", product });
  } catch (err) {
    console.error("Error during export:", err);
    res.status(500).json({ error: "Lỗi khi xuất kho" });
  }
});

// 📌 API: Điều chỉnh kho (cập nhật số lượng thực tế khi kiểm kê)
app.put("/api/inventory/dieuchinh", async (req, res) => {
  try {
    const { productId, newQuantity } = req.body;
    let record = await Inventory.findOne({ productId });
    if (!record) {
      record = new Inventory({ productId, quantity: newQuantity });
    } else {
      record.quantity = newQuantity;
    }
    record.lastUpdated = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------- Kết thúc API -----------------------

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
