import * as express from 'express';
import * as cors from 'cors';
import IndexerService from './services/IndexerService';
const app = express();
import 'dotenv/config';

//open cors
app.use(cors())
app.use(express.json());
const indexerService = new IndexerService();

app.get('/counters', async (req, res) => {
  try {
    const couters = await indexerService.getCounters();
    res.send(couters);
  } catch (err) {
    console.log("err: ", err);
    res.status(500).send({
      message: err.message
    });
  }
})

app.get('/configs', async function (req, res) {
  try {
    const configs = await indexerService.getConfigs();
    res.send(configs);
  } catch (err) {
    console.log("err: ", err);
    res.status(500).send({
      message: err.message
    });
  }
})

app.post('/configs', async function (req, res) {
  try {
    const data = req.body;
    console.log("update configs data: ", data);
    await indexerService.updateConfig(data);
    res.send("Update success");
  } catch (err) {
    console.log("err: ", err);
    res.status(500).send({
      message: err.message
    });
  }
})


app.get('/rabbitmq', async (req, res) => {
  try {
    const rabbitmq = await indexerService.getRabbitMQ();
    res.send(rabbitmq);
  } catch (err) {
    console.log("err: ", err);
    res.status(500).send({
      message: err.message
    });
  }
})



const port = process.env.PORT || 8081;

const server = app.listen(port, function () {
  const host = server.address().address
  const port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})