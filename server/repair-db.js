require('dotenv').config();
const sequelize = require('./config/database');

async function repair() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("DESCRIBE estadossolicitud");
    console.log("Columnas encontradas:", results.map(r => r.Field).join(", "));
    
    const colName = results.find(r => r.Field !== 'IdEstado').Field;
    await sequelize.query(`INSERT IGNORE INTO estadossolicitud (IdEstado, ${colName}) VALUES (5, 'Expulsado');`);
    
    console.log(`✅ Estado 'Expulsado' (5) añadido con éxito usando columna '${colName}'.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al reparar DB:", error);
    process.exit(1);
  }
}

repair();
