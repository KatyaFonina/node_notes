// test/setup.js
const mongoose = require('mongoose');
const config = require('../config/config');

beforeAll(async () => {
  await mongoose.connect(config.database.testUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});