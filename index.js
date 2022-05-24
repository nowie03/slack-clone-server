import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { ApolloServer, gql } from "apollo-server-express";
import { PubSub, withFilter } from "graphql-subscriptions";
import { Sequelize } from "sequelize";
import { createServer } from "http";
import { fileLoader, mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import models from "./models";
import path from "path";
import verifyUser from "./middlewares/verifyUser";
import { applyMiddleware } from "graphql-middleware";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "./graphql/resolvers"))
);
const typeDefs = mergeTypes(
  fileLoader(path.join(__dirname, "./graphql/schemas"))
);

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const pubsub = new PubSub();

  const server = new ApolloServer({
    schema,
    context: async ({ req, res }) => {
      // await verifyUser(req, res);
      return {
        pubsub,
        models,
        user: req.user,
        ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET,
      };
    },
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

  await new Promise((resolve) => {
    httpServer.listen({ port: process.env.PORT || PORT }, resolve),
      (reject) => {
        console.log("unable to connect to database");
      };
  });
  console.log(`server ready at localhost:4000${server.graphqlPath}`);
}

models.sequelize.sync().then(() => {
  startApolloServer(typeDefs, resolvers);
});
