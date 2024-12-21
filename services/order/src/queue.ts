import amqp from "amqplib";

const sendToQueue = async (queue: string, message: string) => {
  try {
    const connnection = await amqp.connect(process.env.QUEUE_URL!);
    const channel = await connnection.createChannel();

    const exchange = "order_exchange";

    await channel.assertExchange(exchange, "direct", {
      durable: true,
    });

    channel.publish(exchange, queue, Buffer.from(message));
    console.log(`Message sent to queue ${queue}`);

    setTimeout(() => {
      connnection.close();
    }, 500);
  } catch (error) {
    console.log("Error in sendToQueue", error);
    throw error;
  }
};

export default sendToQueue;
