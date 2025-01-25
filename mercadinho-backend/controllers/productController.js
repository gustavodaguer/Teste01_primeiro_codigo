const Product = require("../models/Product");

// Controlador para criar um produto
exports.createProduct = async (req, res) => {
  try {
    const {
      barcode,
      name,
      unitOfMeasure,
      stockQuantity,
      costPrice,
      salePrice,
      promotionPrice,
      minQuantity,
      maxQuantity,
      supplierId,
    } = req.body;

    const product = await Product.create({
      barcode,
      name,
      unitOfMeasure,
      stockQuantity,
      costPrice,
      salePrice,
      promotionPrice,
      minQuantity,
      maxQuantity,
      SupplierId: supplierId, // Associa o produto ao fornecedor
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar produto", details: error });
  }
};

// Controlador para listar todos os produtos
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar produtos", details: error });
  }
};

// Controlador para obter um produto pelo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produto", details: error });
  }
};

// Controlador para atualizar um produto
exports.updateProduct = async (req, res) => {
  try {
    const {
      barcode,
      name,
      unitOfMeasure,
      stockQuantity,
      costPrice,
      salePrice,
      promotionPrice,
      minQuantity,
      maxQuantity,
      supplierId,
    } = req.body;

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Atualiza os dados do produto, se forem fornecidos
    product.barcode = barcode || product.barcode;
    product.name = name || product.name;
    product.unitOfMeasure = unitOfMeasure || product.unitOfMeasure;
    product.stockQuantity = stockQuantity || product.stockQuantity;
    product.costPrice = costPrice || product.costPrice;
    product.salePrice = salePrice || product.salePrice;
    product.promotionPrice = promotionPrice || product.promotionPrice;
    product.minQuantity = minQuantity || product.minQuantity;
    product.maxQuantity = maxQuantity || product.maxQuantity;
    product.SupplierId = supplierId || product.SupplierId;

    await product.save();
    res.json(product);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Erro ao atualizar produto", details: error });
  }
};

// Controlador para deletar um produto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    await product.destroy();
    res.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar produto", details: error });
  }
};
