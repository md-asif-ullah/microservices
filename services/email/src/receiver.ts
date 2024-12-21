import amqp from "amqplib";

const receiveFromQueue = async (
  queue: string,
  callback: (message: string) => void
) => {
  if (!process.env.QUEUE_URL) {
    throw new Error("QUEUE_URL environment variable is not defined.");
  }

  try {
    const connection = await amqp.connect(process.env.QUEUE_URL);
    const channel = await connection.createChannel();

    const exchange = "order_exchange";

    await channel.assertExchange(exchange, "direct", { durable: true });

    const q = await channel.assertQueue(queue, { exclusive: false });

    await channel.bindQueue(q.queue, exchange, queue);

    channel.consume(
      q.queue,
      (message) => {
        if (message) {
          callback(message.content.toString());
          channel.ack(message);
        }
      },
      { noAck: false }
    );

    console.log(`Waiting for messages in queue: ${queue}`);
  } catch (error) {
    console.error("Error receiving from queue:", error);
  }
};

receiveFromQueue("send-email", (message) => {
  console.log(`Received message: ${message}`);
});
