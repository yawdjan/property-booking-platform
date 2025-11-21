import { Sequelize } from 'sequelize';
import config from './config.js';

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    // logging: config.nodeEnv === 'development' ? console.log : false,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
sequelize
  .authenticate()
  .then(() => console.log('✅ PostgreSQL connected successfully'))
  .catch(err => console.error('❌ Unable to connect to database:', err));

export default sequelize;