const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Erro ao se conectar com o BD: ' + err.message);
    process.exit(1); // Encerra o processo em caso de falha
  }
};

module.exports = connectDB;