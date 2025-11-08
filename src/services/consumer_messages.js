import * as amqp from 'amqplib';

const rabbitSettings = {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'admin',
    password: '1234',
    vhost: '/',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
};

connect (); 

async function connect() {

    const queue = 'messages';

    try {
        const connection = await amqp.connect(rabbitSettings);
        console.log('Connected to RabbitMQ');
        
        const channel = await connection.createChannel();
        console.log('Channel created');

    const res = await channel.assertQueue(queue, { durable: true });
    console.log('Queue asserted', res);

        console.log('Waiting for messages...');

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log('Message received:', messageContent);
                channel.ack(msg);
            }
        });


    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
}

