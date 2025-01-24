const Sale = require("../models/Sale");
const Product = require("../models/Product");
const SaleProduct = require("../models/SaleProduct");
const Client = require("../models/Client");

// Controlador para registrar uma venda
exports.createSale = async (req, res) => {
  try {
    const { clientId, deliveryAddress, paymentType, products } = req.body;

    // Validação do cliente
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Calcular o valor total da venda
    let totalValue = 0;
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Produto ${item.productId} não encontrado` });
      }
      totalValue += product.salePrice * item.quantity;
    }

    // Verificação do pagamento pela loja e limite de crédito do cliente
    if (paymentType === "Loja" && totalValue > client.credit) {
      return res
        .status(400)
        .json({ error: "Venda excede o limite de crédito do cliente" });
    }

    // Criação da venda
    const sale = await Sale.create({
      ClientId: clientId,
      deliveryAddress,
      totalValue,
      paymentType,
      status: paymentType === "Loja" ? "Pendente" : "Paga", // Se for "Loja", a venda fica pendente
    });

    // Relacionar os produtos vendidos à venda
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      await SaleProduct.create({
        SaleId: sale.id,
        ProductId: product.id,
        quantity: item.quantity,
        unitPrice: product.salePrice,
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: "Erro ao registrar venda", details: error });
  }
};

// Controlador para listar todas as vendas
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({ include: [Client, Product] });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar vendas", details: error });
  }
};

// Controlador para buscar uma venda específica pelo ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [Client, Product],
    });
    if (!sale) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar venda", details: error });
  }
};
