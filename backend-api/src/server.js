const app = require("./app");
const env = require("./config/env");
const { testConnection } = require("./config/database");
const createTables = require("./database/schema");
const seedAdmin = require("./database/seedAdmin");
const logger = require("./config/logger");

const startServer = async () => {
  try {
    await testConnection();
    await createTables();
    await seedAdmin();

    app.listen(env.port, () => {
      logger.info(`Servidor backend escuchando en puerto ${env.port}`);
    });
  } catch (error) {
    logger.error(`Error al iniciar backend: ${error.message}`);
    process.exit(1);
  }
};

startServer();
