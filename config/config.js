
require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,  
    environment: process.env.NODE_ENV || 'development'
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/notesdb',  
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/notesdb_test'
  },
  api: {
    version: '1.0',
    basePath: '/api'
  }
};