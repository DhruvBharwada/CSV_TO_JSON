const express = require('express');
const config = require('./config');
const csvRouter = require('./routes/csvRouter');

const app = express();

app.use(express.json());

app.use('/api', csvRouter);


app.get('/', (req, res) => {
  res.send('CSV to JSON converter API is running.');
});

app.listen(config.port, () => {

  console.info(`Server listening on port ${config.port}`);
});