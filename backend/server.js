const express = require('express');
const cors = require('cors');
const sequelize = require('./database');

const app = express();
app.use(express.json());
app.use(cors());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  try {
    await sequelize.sync(); // Sincroniza com o banco de dados
    console.log('📂 Banco de dados sincronizado');
  } catch (err) {
    console.error('❌ Erro ao sincronizar:', err);
  }
});
