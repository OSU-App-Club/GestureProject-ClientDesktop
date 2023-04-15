import moveMouse from './moveMouse.ts';
import { Server as WebSocketServer, WebSocket } from 'ws';
import amqp from 'amqplib/callback_api';

const URI =
    'amqps://pdohatix:7I0Wco0RKRe8z4LC3uGx4k-7uqWqNCmL@beaver.rmq.cloudamqp.com/pdohatix';

let amqpConnection: any = null; // store the amqp connection object

main();

function main() {
    const wss = new WebSocketServer({ port: 5000, path: '/rabbitmq' });
    console.log('WebSocket server listening on port 5000');

    // Wait for a client to connect to the WebSocket server
    wss.on('connection', (ws: any, request: any) => {
        console.log('Client connected');

        // disconnect previous RabbitMQ connection if it exists
        disconnectAMQP();

        // forcefully disconnect existing websocket clients
        wss.clients.forEach((client: any) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.terminate();
            }
        });

        // Get query parameters from the request URL
        const urlParams = new URLSearchParams(request.url.split('?')[1]);

        // Get the value of the 'pin' parameter
        const pinCode = urlParams.get('pinCode');

        if (pinCode == null) {
            console.error('Missing pinCode parameter');
            ws.send('Missing pinCode parameter');
            ws.close();
            return;
        }

        // Do something with the pin parameter
        console.log('Received pinCode parameter:', pinCode);

        const exchangeName = 'msgExchange';
        const queueName = `queue-${pinCode}`;
        const routingKey = `key-${pinCode}`;

        // Connect to RabbitMQ
        amqp.connect(URI, (err: any, conn: any) => {
            if (err) {
                console.error('Error connecting to RabbitMQ:', err);
                ws.send('Error connecting to RabbitMQ');
                ws.close();
                return;
            }

            amqpConnection = conn; // store the amqp connection object

            // Create a channel on the RabbitMQ connection
            conn.createChannel((err: any, ch: any) => {
                if (err) {
                    console.error(
                        'Error creating channel on RabbitMQ connection:',
                        err
                    );
                    ws.send('Error creating channel on RabbitMQ connection');
                    ws.close();
                    return;
                }

                // Declare a queue to receive messages on
                ch.assertQueue(
                    queueName,
                    { durable: true, exclusive: true, autoDelete: true },
                    (err: any, q: any) => {
                        if (err) {
                            console.error(err);
                            ws.send('Error declaring queue');
                            ws.close();
                            return;
                        }

                        // Bind the queue to the exchange
                        ch.bindQueue(q.queue, exchangeName, routingKey);
                        console.log(
                            `Listening for messages on queue ${queueName}`
                        );

                        // Listen for messages on the queue
                        ch.consume(
                            q.queue,
                            (msg: any) => {
                                if (msg !== null) {
                                    try {
                                        const body = Buffer.from(msg.content);
                                        const message = JSON.parse(
                                            body.toString()
                                        );

                                        console.log(
                                            `Received message: ${JSON.stringify(
                                                message
                                            )}`
                                        );

                                        const { x, y, width, height, gesture } =
                                            message;
                                        // make sure x, y, width, height is a number
                                        if (
                                            typeof x !== 'number' ||
                                            typeof y !== 'number' ||
                                            typeof width !== 'number' ||
                                            typeof height !== 'number'
                                        ) {
                                            console.error(
                                                'x, y, width, height is not a number'
                                            );
                                            return;
                                        }

                                        // make sure x and y are b/t 0 and width or height
                                        if (
                                            x < 0 ||
                                            x > width ||
                                            y < 0 ||
                                            y > height
                                        ) {
                                            console.error(
                                                'x or y is out of bounds'
                                            );
                                            return;
                                        }

                                        // Send the message to the client over the WebSocket connection
                                        ws.send(JSON.stringify(message));

                                        // Move the mouse
                                        moveMouse(x, y, width, height, gesture);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }
                            },
                            { noAck: true }
                        );
                    }
                );
            });
        });

        // Listen for WebSocket close events
        ws.on('close', () => {
            console.log('Client disconnected');
            disconnectAMQP();
        });
    });
}

function disconnectAMQP() {
    // Close the AMQP connection and channel when the WebSocket connection is closed
    if (amqpConnection !== null) {
        amqpConnection.close();
        amqpConnection = null;
    }
}
