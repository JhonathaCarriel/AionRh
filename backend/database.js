const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao PostgreSQL'))
  .catch(err => console.error('❌ Erro ao conectar ao PostgreSQL:', err));

module.exports = sequelize;
