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
    // Busca todos os produtos que estão abaixo da quantidade mínima
    const lowStockProducts = await Product.findAll({
      where: {
        stockQuantity: {
          [sequelize.Op.lt]: sequelize.col("minQuantity"), // Comparação entre quantidade em estoque e mínimo
        },
      },
      include: Supplier,
    });

    if (lowStockProducts.length === 0) {
      return res
        .status(200)
        .json({ message: "Nenhum produto precisa ser reabastecido." });
    }

    // Agrupa os produtos por fornecedor
    const ordersToCreate = {};
    lowStockProducts.forEach((product) => {
      const supplierId = product.SupplierId;

      if (!ordersToCreate[supplierId]) {
        ordersToCreate[supplierId] = {
          supplier: product.Supplier,
          products: [],
          totalValue: 0,
        };
      }

      // Calcular a quantidade a ser pedida
      const quantityToOrder = product.maxQuantity - product.stockQuantity;
      ordersToCreate[supplierId].products.push({
        productId: product.id,
        quantity: quantityToOrder,
        unitCostPrice: product.costPrice,
        totalCost: product.costPrice * quantityToOrder,
      });
      ordersToCreate[supplierId].totalValue +=
        product.costPrice * quantityToOrder;
    });

    // Criar pedidos por fornecedor
    const createdOrders = [];
    for (const supplierId in ordersToCreate) {
      const orderData = ordersToCreate[supplierId];
      const order = await Order.create({
        totalValue: orderData.totalValue,
        SupplierId: supplierId,
      });

      for (const productData of orderData.products) {
        await OrderProduct.create({
          OrderId: order.id,
          ProductId: productData.productId,
          quantity: productData.quantity,
          unitCostPrice: productData.unitCostPrice,
        });
      }

      createdOrders.push(order);
    }

    res.status(201).json({
      message: "Pedidos de reabastecimento gerados com sucesso",
      orders: createdOrders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao gerar pedidos automaticamente", details: error });
  }
};
