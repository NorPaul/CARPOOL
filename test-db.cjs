const sequelize = require('./server/config/database');
const User = require('./server/models/User');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    const users = await User.findAll();
    console.log('Users:', users.map(u => u.toJSON()));
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
