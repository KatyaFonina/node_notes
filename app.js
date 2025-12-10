require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const noteRoutes = require('./routes/noteRoutes');
const config = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notesdb';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api', noteRoutes);


app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});


const initializeServer = async () => {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log(' MongoDB успешно подключен');
    
    const server = app.listen(config.server.port, () => {
      console.log(` Сервер запушен на ${config.server.port}`);
    });

   
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Порт ${config.server.port} уже занят`);
      } else {
        console.error(' Server error:', error.message);
      }
      process.exit(1);
    });

  } catch (dbError) {
    console.error(' MongoDB не удалось подключить:', dbError.message);
    process.exit(1);
  }
};


initializeServer();

module.exports = app;