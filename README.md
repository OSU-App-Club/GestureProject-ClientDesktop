# Client Desktop

Setup

```bash
pnpm i
```

Launch API in one terminal

-   Starts a websocket where only 1 client is allowed to connect at a time to a create new RabbitMQ queue connection
-   NOTE: This api is not made up by NextJS, it is a separate API that is used to create a new connection to RabbitMQ. The NextJS pages/api directory was deleted.
-   NOTE: The reason for a separate API in the backend is b/c NextJS does not allow the amqplib package to be run on the frontend (complains that .net module is not found)

```bash
cd api
ts-node index.ts
```

Start NextJS in another terminal

-   This is where the user enters the pincode before establishing a connection to the API

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
