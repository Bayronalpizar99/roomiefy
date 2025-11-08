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

    const msgs = [
        { text: 'Hello World 1' },
        { text: 'Hello World 2' },
        { text: 'Hello World 3' }
    ];

    try {
        const connection = await amqp.connect(rabbitSettings);
        console.log('Connected to RabbitMQ');
        
        const channel = await connection.createChannel();
        console.log('Channel created');

    const res = await channel.assertQueue(queue, { durable: true });
        console.log('Queue asserted', res);

        msgs.forEach((msg) => {
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
            console.log('Message sent', msg);
        });


    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
}

