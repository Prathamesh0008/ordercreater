import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

export type Role = "USER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PACKED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export type Recipient = {
  id: string;
  userId: string;
  name: string;
  address: string;
  contactPhone?: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  whatsappNumber?: string;
  profilePhoto?: string;
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  routeType: "EUROPE_TO_EUROPE" | "US";
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  contactPhone?: string;
  status?: OrderStatus;
  trackingId?: string;
  createdAt: string;
  updatedAt?: string;
  items: { id: string; name: string; quantity: number }[];
};

type NewOrderInput = {
  routeType: "EUROPE_TO_EUROPE" | "US";
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  contactPhone?: string;
  saveAddress?: boolean;
  items: { name: string; quantity: number }[];
};

type MongoUser = User & { _id?: unknown };
type MongoOrder = Order & { _id?: unknown };
type MongoRecipient = Recipient & { _id?: unknown };

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "kva2";

if (!uri) throw new Error("MONGODB_URI is required");

const adminEmail = (process.env.ADMIN_EMAIL || "admin@kva.com").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
const adminName = process.env.ADMIN_NAME || "Main Admin";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoPromise?: Promise<MongoClient>;
};

const client = globalForMongo.mongoClient || new MongoClient(uri);
const clientPromise = globalForMongo.mongoPromise || client.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
  globalForMongo.mongoPromise = clientPromise;
}

async function getDb() {
  return (await clientPromise).db(dbName);
}

async function usersCollection() {
  return (await getDb()).collection<MongoUser>("users");
}

async function ordersCollection() {
  return (await getDb()).collection<MongoOrder>("orders");
}

async function recipientsCollection() {
  return (await getDb()).collection<MongoRecipient>("recipients");
}

function stripId<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> {
  const { _id, ...rest } = doc;
  return rest;
}

function normalizeOrderStatus(status?: string | null): OrderStatus {
  const allowed: OrderStatus[] = [
    "PENDING",
    "PROCESSING",
    "PACKED",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELLED",
  ];

  return allowed.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : "PENDING";
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    status: normalizeOrderStatus(order.status),
    trackingId: order.trackingId || "",
  };
}

export async function ensureAdminUser() {
  const users = await usersCollection();
  const hash = await bcrypt.hash(adminPassword, 10);

  await users.updateMany(
    { role: "ADMIN", email: { $ne: adminEmail } },
    { $set: { role: "USER" } }
  );

  const existingAdmin = await users.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await users.insertOne({
      id: crypto.randomUUID(),
      name: adminName,
      email: adminEmail,
      passwordHash: hash,
      role: "ADMIN",
      createdAt: new Date().toISOString(),
    });

    return;
  }

  if (existingAdmin.role !== "ADMIN") {
    await users.updateOne(
      { email: adminEmail },
      { $set: { role: "ADMIN" } }
    );
  }
}

export async function findUserByEmail(email: string) {
  const user = await (await usersCollection()).findOne({
    email: email.toLowerCase(),
  });

  return user ? (stripId(user) as User) : null;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  whatsappNumber: string,
  profilePhoto: string
) {
  const users = await usersCollection();
  const passwordHash = await bcrypt.hash(password, 10);

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "USER",
    whatsappNumber,
    profilePhoto,
    createdAt: new Date().toISOString(),
  };

  await users.insertOne(user);

  return user;
}

export async function verifyUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) return null;

  return (await bcrypt.compare(password, user.passwordHash)) ? user : null;
}

export async function upsertRecipient(
  userId: string,
  name: string,
  address: string,
  contactPhone?: string
) {
  const recipients = await recipientsCollection();

  const existing = await recipients.findOne({
    userId,
    name,
    address,
  });

  if (existing) return stripId(existing) as Recipient;

  const recipient: Recipient = {
    id: crypto.randomUUID(),
    userId,
    name,
    address,
    contactPhone,
    createdAt: new Date().toISOString(),
  };

  await recipients.insertOne(recipient);

  return recipient;
}

export async function importRecipientsBulk(
  userId: string,
  rows: { name: string; address: string; contactPhone?: string }[]
) {
  let importedCount = 0;

  for (const row of rows) {
    const before = await getRecipientsByUser(userId);

    await upsertRecipient(userId, row.name, row.address, row.contactPhone);

    const after = await getRecipientsByUser(userId);

    if (after.length > before.length) importedCount++;
  }

  const recipients = await getRecipientsByUser(userId);

  return { importedCount, recipients };
}

export async function getRecipientsByUser(userId: string) {
  const docs = await (await recipientsCollection())
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((x) => stripId(x) as Recipient);
}

export async function deleteRecipientById(userId: string, id: string) {
  const result = await (await recipientsCollection()).deleteOne({
    userId,
    id,
  });

  return result.deletedCount > 0;
}

export async function createOrdersBulk(
  userId: string,
  parcels: NewOrderInput[]
) {
  const orders = await ordersCollection();
  const created: Order[] = [];

  for (const parcel of parcels) {
    const order: Order = {
      id: crypto.randomUUID(),
      userId,
      routeType: parcel.routeType,
      title: parcel.title,
      address: parcel.address,
      city: parcel.city,
      state: parcel.state,
      zipCode: parcel.zipCode,
      country: parcel.country,
      contactPhone: parcel.contactPhone,
      status: "PENDING",
      trackingId: "",
      createdAt: new Date().toISOString(),
      items: parcel.items.map((x) => ({
        id: crypto.randomUUID(),
        name: x.name,
        quantity: x.quantity,
      })),
    };

    await orders.insertOne(order);

    created.push(order);

    if (parcel.saveAddress) {
      await upsertRecipient(
        userId,
        parcel.title,
        parcel.address,
        parcel.contactPhone
      );
    }
  }

  return created;
}

export async function getOrdersByUser(userId: string) {
  const docs = await (await ordersCollection())
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((x) => normalizeOrder(stripId(x) as Order));
}

export async function getAllOrdersWithUsers() {
  const [orderDocs, userDocs] = await Promise.all([
    (await ordersCollection()).find({}).sort({ createdAt: -1 }).toArray(),
    (await usersCollection()).find({}).toArray(),
  ]);

  const userMap = new Map(
    userDocs.map((u) => [u.id, stripId(u) as User])
  );

  return orderDocs.map((order) => ({
    ...normalizeOrder(stripId(order) as Order),
    user: userMap.get(order.userId),
  }));
}

export async function updateOrderAdminFields({
  orderId,
  status,
  trackingId,
}: {
  orderId: string;
  status: OrderStatus;
  trackingId: string;
}) {
  const orders = await ordersCollection();

  const result = await orders.updateOne(
    { id: orderId },
    {
      $set: {
        status,
        trackingId,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return null;
  }

  const updated = await orders.findOne({ id: orderId });

  return updated ? normalizeOrder(stripId(updated) as Order) : null;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const orders = await ordersCollection();

  const result = await orders.updateOne(
    { id: orderId },
    {
      $set: {
        status,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return null;
  }

  const updated = await orders.findOne({ id: orderId });

  return updated ? normalizeOrder(stripId(updated) as Order) : null;
}