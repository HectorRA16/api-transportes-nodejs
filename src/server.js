const app = require('./app');
const { connectMySQL } = require('./config/mysql');
const { connectMongo } = require('./config/mongo');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await connectMySQL();
        await connectMongo();

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error.message);
    }
}

iniciarServidor();