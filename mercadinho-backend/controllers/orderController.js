const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderProduct = require("../models/OrderProduct");
const Supplier = require("../models/Supplier");

// Controlador para listar todos os pedidos
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ include: [Supplier, Product] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar pedidos", details: error });
  }
};

// Controlador para gerar automaticamente um pedido de reabastecimento
exports.generateAutomaticOrder = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findByPk(productId, { include: Supplier });

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const supplier = product.Supplier;
    if (!supplier) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }

    // Calcula a quantidade para reabastecimento
    const quantityToOrder = product.maxQuantity - product.stockQuantity;
    const totalCost = quantityToOrder * product.costPrice;

    // Criação das contas a pagar baseadas no número de parcelas do fornecedor
    const installmentAmount = totalCost / supplier.maxInstallments;
    const today = new Date();

    for (let i = 0; i < supplier.maxInstallments; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);

      await Payable.create({
        SupplierId: supplier.id,
        amount: installmentAmount,
        dueDate,
      });
    }

    // Atualiza a quantidade do produto no estoque
    await product.update({ stockQuantity: product.maxQuantity });

    res.status(201).json({
      message:
        "Pedido de reabastecimento criado e contas a pagar geradas com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar pedido de reabastecimento:", error);
    res
      .status(500)
      .json({ message: "Erro ao criar pedido de reabastecimento", error });
  }
};
