import express from "express";
import bodyParser from "body-parser";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { ApolloServer, gql } from "apollo-server-express";
import { PubSub, withFilter } from "graphql-subscriptions";
const { createServer } = require("http");

import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const pubsub = new PubSub();

  const server = new ApolloServer({
    schema,
    context: () => ({ pubsub }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();
  server.applyMiddleware({
    app,
    path: "/",
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      async onConnect(connectionParams, webSocket) {
        console.log("connected");
        return { pubsub };
      },
      async onDisconnect(connectionParams, webSocket) {},
    },
    {
      server: httpServer,
      path: "/graphql",
    }
  );

  const PORT = 4000;

  await new Promise((resolve) =>
    httpServer.listen({ port: process.env.PORT || PORT }, resolve)
  );
  console.log(`server ready at localhost:4000${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers);
