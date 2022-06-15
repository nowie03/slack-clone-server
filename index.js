import "dotenv/config";
import express from "express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServer, gql } from "apollo-server-express";
import { PubSub } from "graphql-subscriptions";
import { createServer } from "http";
import { fileLoader, mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import models from "./models";
import path from "path";
import auth from "./middlewares/auth";
const pubsub = new PubSub();

const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "./graphql/resolvers"))
);
const typeDefs = mergeTypes(
  fileLoader(path.join(__dirname, "./graphql/schemas"))
);

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx, msg, args) => {
        return {
          pubsub,
          models,
        };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context: async ({ req, res }) => {
      await auth(req, res);
      return {
        pubsub,
        models,
        user: req.user,
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
  });

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
