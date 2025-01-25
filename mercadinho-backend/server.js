const express = require("express");
const sequelize = require("./config/database");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/clientRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");
const receivableRoutes = require("./routes/receivableRoutes");
const payableRoutes = require("./routes/payableRoutes");
const orderRoutes = require("./routes/orderRoutes"); // Novas rotas de pedidos

const app = express();
const port = 4321;

const cron = require("node-cron");
const orderController = require("./controllers/orderController");

// Agendamento para verificar estoque e gerar pedidos diariamente às 6h
cron.schedule("0 6 * * *", () => {
  console.log("Verificando estoque para gerar pedidos de reabastecimento...");
  orderController.generateAutomaticOrder();
});

// Middleware para interpretar JSON
app.use(express.json());

// Testando a conexão com o banco de dados
sequelize
  .authenticate()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
  })
  .catch((err) => {
    console.error("Erro ao conectar ao banco de dados:", err);
  });

// Rotas de autenticação
app.use("/api/auth", authRoutes);

// Rotas de clientes
app.use("/api", clientRoutes);

// Rotas de fornecedores
app.use("/api", supplierRoutes);

// Rotas de produtos (estoque)
app.use("/api", productRoutes);

// Rotas de vendas
app.use("/api", saleRoutes);

// Rotas de contas a receber
app.use("/api", receivableRoutes);

// Rotas de contas a pagar
app.use("/api", payableRoutes);

// Rotas de pedidos
app.use("/api", orderRoutes);

// Servidor rodando
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
