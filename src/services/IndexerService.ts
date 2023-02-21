import { Client } from 'pg';
import 'dotenv/config';
import * as amqp from 'amqplib';
class IndexerService {
    private _pgClient: Client = null;

    private _rabbitMQChannel: any = null;

    private async _initPg() {
        try {
            if (this._pgClient) return;
            this._pgClient = new Client({
                user: process.env.DB_USER_NAME,
                password: process.env.DB_PASSWORD,
                host: process.env.DB_HOST,
                port: 5432,
                database: process.env.DB_NAME,
            });
            await this._pgClient.connect();
        } catch (error) {
            console.log("Init pg connection error: ", error);
        }
    }

    private async _initRabbitMQ() {
        try {
            if (this._rabbitMQChannel) return;
            let connection = await amqp.connect(process.env.RABBITMQ_URL);
            let channel = await connection.createConfirmChannel();
            this._rabbitMQChannel = channel;
        } catch (err) {
            console.log("Init rabbitmq connection error: ", err);
        }
    }
    public async getCounters() {
        await this._initPg();
        const counterQueryResult = await this._pgClient.query(
            `SELECT * FROM ${process.env.DB_SCHEMA}.counters ORDER BY relation_name;`
        );

        return counterQueryResult.rows;

    }

    public async getConfigs() {
        await this._initPg();
        const configQueryResult = await this._pgClient.query(
            `SELECT * FROM ${process.env.DB_SCHEMA}.indexer_conf;`
        );
        console.log("configQueryResult: ", configQueryResult);

        return configQueryResult.rows;
    }

    public async updateConfig(data: any) {
        await this._initPg();
        const updateConfigQueryResult = await this._pgClient.query(`
            UPDATE ${process.env.DB_SCHEMA}.indexer_conf SET value = ${data.value} WHERE key = '${data.key}'
        `);
    }

    public async getRabbitMQ() {
        const listQueueNames = [
            'evm-indexer-event-transfer',
            'evm-indexer-save-data',
            'evm-indexer-save-balance',
            'evm-indexer-push-event-error',
            'evm-indexer-save-transaction',
        ]

        await this._initRabbitMQ();
        const listQueues = [];
        for(const queueName of listQueueNames) {
            const queue = await this._rabbitMQChannel.assertQueue(queueName, {
                durable: false
            });
            listQueues.push(queue);
        }
        //close channel
        await this._rabbitMQChannel.close();
        this._rabbitMQChannel = null;
        return listQueues;

    }

}

export default IndexerService;