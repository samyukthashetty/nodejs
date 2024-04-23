const express = require('express');
const bodyParser = require('body-parser');
const usersRouter = require('./userauthen');

const app = express();
const PORT = 3000;


app.use(bodyParser.json());


app.use('/users', usersRouter);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
