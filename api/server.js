const app = require('./app');

const PORT = 3000;
const errorMiddleware = require('../middlwares/errorMiddleware');
const { create, login } = require('../controllers/userController');

app.listen(3000, () => console.log(`App running on port ${PORT}`));
app.post('/register', create);
app.post('/login', login);
app.get('/ping', () => console.log('pong'));
app.use(errorMiddleware);
