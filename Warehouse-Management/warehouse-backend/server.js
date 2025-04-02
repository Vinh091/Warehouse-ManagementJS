require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { Sequelize, DataTypes, Op } = require("sequelize");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MYSQL_HOST = process.env.MYSQL_HOST || "localhost";
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "warehouse_db";
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;

// Kết nối MySQL qua Sequelize
const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  dialect: "mysql",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("✅ MySQL connected"))
  .catch((err) => {
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

// Định nghĩa các models sử dụng Sequelize

// Model sản phẩm
const Product = sequelize.define(
  "Product",
  {
    code: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    quantity: { type: DataTypes.INTEGER },
    price: { type: DataTypes.FLOAT },
    supplier: { type: DataTypes.STRING },
    minThreshold: { type: DataTypes.INTEGER },
    image: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: false,
    tableName: "products",
  }
);

// Schema cho doanh số bán hàng
const Sale = sequelize.define(
  "Sale",
  {
    date: { type: DataTypes.STRING },
    seller: { type: DataTypes.STRING },
    amount: { type: DataTypes.FLOAT },
  },
  {
    timestamps: false,
    tableName: "sales",
  }
);

// Model đơn hàng (Order)
const Order = sequelize.define(
  "Order",
  {
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: false,
    tableName: "orders",
  }
);

// Model nhập hàng (Import)
const Import = sequelize.define(
  "Import",
  {
    totalCost: { type: DataTypes.FLOAT, allowNull: false },
    importDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: false,
    tableName: "imports",
  }
);

// Model giao dịch nhập/xuất kho
const Transaction = sequelize.define(
  "Transaction",
  {
    type: {
      type: DataTypes.ENUM("import", "export"),
      allowNull: false,
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: false,
    tableName: "transactions",
  }
);

// Liên kết Transaction với Product
Transaction.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Transaction, { foreignKey: "productId" });

// Schema cho quản lý kho hàng (Inventory)
const Inventory = sequelize.define(
  "Inventory",
  {
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: false,
    tableName: "inventories",
  }
);
Inventory.belongsTo(Product, { foreignKey: "productId" });
Product.hasOne(Inventory, { foreignKey: "productId" });

// Đồng bộ các models (nếu cần, có thể dùng migrations thay cho sync trong production)
sequelize.sync().then(() => {
  console.log("✅ All models synced");
});

// ---------------------- Các API ----------------------
// 📌 API: Lấy danh sách sản phẩm
app.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res
      .status(500)
      .json({ error: "Lỗi khi lấy danh sách sản phẩm" });
  }
});

// API thêm sản phẩm
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      quantity,
      price,
      supplier,
    } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newProduct = await Product.create({
      code,
      name,
      description,
      quantity,
      price,
      supplier,
      minThreshold: 10, // Thiết lập giá trị mặc định là 10
      image,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({
      error: "Lỗi khi thêm sản phẩm",
      details: error.message,
    });
  }
});

// Thêm sau các API hiện có
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }
  } catch (error) {
    console.error("Lỗi khi tải thông tin sản phẩm:", error);
    res.status(500).json({ error: "Lỗi khi tải thông tin sản phẩm" });
  }
});

// API tìm kiếm sản phẩm
app.get("/products/search", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({
        error: "Vui lòng nhập tên sản phẩm để tìm kiếm",
      });
    }
    const results = await Product.findAll({
      where: {
        name: { [Op.like]: `%${name}%` },
      },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tìm kiếm sản phẩm" });
  }
});

// 📌 API: Cập nhật sản phẩm
app.put("/products/:id", async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedProduct = await Product.findByPk(req.params.id);
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật sản phẩm" });
  }
});

// 📌 API: Xóa sản phẩm
app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.json({ message: "Sản phẩm đã bị xóa" });
    } else {
      res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa sản phẩm" });
  }
});

// 📌 API: Lấy danh sách doanh số bán hàng
app.get("/sales", async (req, res) => {
  try {
    const sales = await Sale.findAll();
    res.json(sales);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi khi lấy doanh số bán hàng" });
  }
});

// 📌 API: Thêm dữ liệu doanh số bán hàng
app.post("/sales", async (req, res) => {
  try {
    const newSale = await Sale.create(req.body);
    res.json(newSale);
  } catch (error) {
    res.status(400).json({
      error: "Lỗi khi thêm doanh số bán hàng",
      details: error.message,
    });
  }
});

// 📌 API: Xóa doanh số bán hàng
app.delete("/sales/:id", async (req, res) => {
  try {
    const deleted = await Sale.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.json({ message: "Giao dịch bán hàng đã bị xóa" });
    } else {
      res.status(404).json({
        error: "Giao dịch bán hàng không tồn tại",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi khi xóa giao dịch bán hàng" });
  }
});

// 📌 API: Lấy dữ liệu tồn kho (báo cáo tồn kho)
app.get("/api/stock-report", async (req, res) => {
  try {
    const stockReport = await Product.findAll({
      attributes: ["code", "name", "quantity", "price", "minThreshold"],
    });
    res.json(stockReport);
  } catch (error) {
    console.error("Error fetching stock report:", error);
    res
      .status(500)
      .json({ error: "Lỗi khi lấy dữ liệu tồn kho" });
  }
});

// 📌 API: Lấy dữ liệu nhập xuất kho
app.get("/api/import-export-report", async (req, res) => {
  try {
    const report = await Transaction.findAll({
      include: [
        {
          model: Product,
          attributes: ["code", "name"],
        },
      ],
    });
    res.json(report);
  } catch (error) {
    console.error("Error fetching import-export report:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu nhập xuất" });
  }
});

// 📌 API: Lấy dữ liệu doanh thu (theo ngày)
app.get("/api/revenue-report", async (req, res) => {
  try {
    const revenueReport = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "totalRevenue"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalOrders"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "DESC"]],
    });
    
    // Đảm bảo trả về mảng dữ liệu đúng định dạng
    const formattedReport = revenueReport.map(item => {
      const data = item.toJSON();
      return {
        id: data.date, // Sử dụng date làm id để component React có thể render
        date: data.date,
        totalRevenue: parseFloat(data.totalRevenue) || 0,
        totalOrders: parseInt(data.totalOrders) || 0
      };
    });
    
    if (formattedReport.length === 0) {
      return res.json([]); // Trả về mảng rỗng thay vì lỗi 404
    }
    
    res.json(formattedReport);
  } catch (err) {
    console.error("❌ Lỗi khi lấy dữ liệu doanh thu:", err);
    res.status(500).json({
      error: "Lỗi server khi lấy dữ liệu báo cáo doanh thu",
      details: err.message,
    });
  }
});

// 📌 API: Lấy dữ liệu cảnh báo tồn kho (sản phẩm dưới ngưỡng tối thiểu)
app.get("/api/stock-warning", async (req, res) => {
  try {
    // Cải thiện câu truy vấn để xử lý minThreshold null
    const lowStockItems = await Product.findAll({
      where: {
        [Op.or]: [
          sequelize.literal('quantity < minThreshold AND minThreshold IS NOT NULL'),
          sequelize.literal('minThreshold IS NULL AND quantity = 0') // Hoặc bất kỳ điều kiện nào bạn muốn áp dụng khi minThreshold là null
        ]
      },
      attributes: ['id', 'code', 'name', 'quantity', 'minThreshold', 'supplier']
    });
    
    console.log("📉 Sản phẩm dưới ngưỡng tồn kho:", lowStockItems.length);
    
    // Trả về mảng rỗng nếu không có sản phẩm nào
    res.json(lowStockItems);
  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu cảnh báo tồn kho:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu cảnh báo tồn kho" });
  }
});

// --------------------- Các API Quản lý kho hàng -----------------------

// 📌 API: Kiểm tra tồn kho
app.get("/api/inventory", async (req, res) => {
  try {
    const inventoryList = await Inventory.findAll({
      include: [
        {
          model: Product,
          attributes: ["name"],
        },
      ],
    });
    res.json(inventoryList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 API: Nhập kho (ghi nhận hàng nhập vào kho)
app.post("/api/inventory/nhap", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }
    
    // Cập nhật số lượng sản phẩm
    product.quantity = parseInt(product.quantity) + parseInt(quantity);
    await product.save({ transaction });
    
    // Tạo giao dịch nhập kho
    await Transaction.create({
      productId: product.id,
      type: "import",
      quantity: parseInt(quantity),
      date: new Date(),
    }, { transaction });
    
    
    await transaction.commit();
    res.json({ message: "Nhập kho thành công", product });
  } catch (err) {
    await transaction.rollback();
    console.error("Error during import:", err);
    res.status(500).json({ error: "Lỗi khi nhập kho" });
  }
});
// 📌 API: Xuất kho (ghi nhận hàng xuất kho)
app.post("/api/inventory/xuat", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }
    
    if (product.quantity < quantity) {
      return res.status(400).json({ error: "Số lượng tồn kho không đủ" });
    }
    
    // Cập nhật số lượng sản phẩm
    product.quantity -= parseInt(quantity);
    await product.save({ transaction });
    
    // Tạo giao dịch xuất kho
    await Transaction.create({
      productId: product.id,
      type: "export",
      quantity: parseInt(quantity),
      date: new Date(),
    }, { transaction });
    
    // Tạo đơn hàng mới để ghi nhận doanh thu
    const totalPrice = product.price * parseInt(quantity);
    await Order.create({
      totalPrice,
      createdAt: new Date()
    }, { transaction });
    
    await transaction.commit();
    res.json({ message: "Xuất kho thành công", product });
  } catch (err) {
    await transaction.rollback();
    console.error("Error during export:", err);
    res.status(500).json({ error: "Lỗi khi xuất kho" });
  }
});

// 📌 API: Điều chỉnh kho (cập nhật số lượng thực tế khi kiểm kê)
app.put("/api/inventory/dieuchinh", async (req, res) => {
  try {
    const { productId, newQuantity } = req.body;
    let record = await Inventory.findOne({ where: { productId } });
    if (!record) {
      record = await Inventory.create({ productId, quantity: newQuantity });
    } else {
      record.quantity = newQuantity;
      record.lastUpdated = new Date();
      await record.save();
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Một script riêng để cập nhật minThreshold cho tất cả sản phẩm chưa có
async function updateMissingMinThresholds() {
  try {
    const products = await Product.findAll({
      where: {
        minThreshold: null
      }
    });
    
    for (const product of products) {
      // Đặt ngưỡng tồn kho tối thiểu là 10% số lượng hiện tại hoặc 5 (tùy trường hợp của bạn)
      const defaultThreshold = Math.max(Math.round(product.quantity * 0.1), 5);
      await product.update({ minThreshold: defaultThreshold });
    }
    
    console.log(`✅ Đã cập nhật ngưỡng tồn kho cho ${products.length} sản phẩm`);
  } catch (error) {
    console.error("Lỗi khi cập nhật ngưỡng tồn kho:", error);
  }
}

// --------------------- Kết thúc API -----------------------

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
