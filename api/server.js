require('dotenv').config();
const express = require('express');
const app = require('./app');
const errorMiddleware = require('../middlwares/errorMiddleware');
const {
  create,
  login,
  deposit,
  transfer,
} = require('../controllers/userController');
const auth = require('../middlwares/auth');

const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`App running on port ${PORT}`));

app.use(express.json());
app.post('/register', create);
app.post('/login', login);
app.post('/deposit', auth, deposit);
app.post('/transfer', auth, transfer);

app.use(errorMiddleware);
