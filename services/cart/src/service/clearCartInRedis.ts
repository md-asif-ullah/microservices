import redis from "@/redis";
import axios from "axios";

const ClearCartInRedis = async (userId: string) => {
  try {
    const data = await redis.hgetall(`cart:${userId}`);

    if (Object.keys(data).length === 0) {
      return;
    }

    const item = Object.keys(data).map((key) => {
      const { inventoryId, quantity } = JSON.parse(data[key]) as {
        inventoryId: string;
        quantity: number;
      };

      return { inventoryId, quantity };
    });

    const request = item.map(async (item) => {
      try {
        await axios.put(
          `${process.env.INVENTORY_SERVICE_URL}/inventory/${item.inventoryId}`,
          {
            inventoryId: item.inventoryId,
            quantity: item.quantity,
            actionType: "IN",
          }
        );
      } catch (error) {
        console.error(
          `Failed to update inventory for ID: ${item.inventoryId}`,
          error
        );
      }
    });

    await Promise.all(request);

    // Clear cart in redis

    await redis.del(`cart:${userId}`);
  } catch (error) {
    console.error("Error in ClearCartInRedis", error);
  }
};

export default ClearCartInRedis;
