const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const PORT = 3000;
const errorMiddleware = require('./middlwares/errorMiddleware');

app.use(bodyParser);
app.listen(3000, () => console.log(`App running on port ${PORT}`));
app.use(errorMiddleware);
