const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const express = require('express');
const http = require('http');

const TrackAPI = require('./datasources/track-api');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startApolloServer(typeDefs, resolvers) {

    // Required logic for integrating with Express
    const app = express();
    const httpServer = http.createServer(app);

    // Same ApolloServer initialization as before, plus the drain plugin.
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      dataSources: () => {
        return {
          trackAPI: new TrackAPI(),
        };
      },
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

      // More required logic for integrating with Express
    await server.start();

    // server.applyMiddleware({ app, ...rest }) is shorthand for app.use(server.getMiddleware(rest))
    server.applyMiddleware({
      app,
      // By default, apollo-server hosts its GraphQL endpoint at the
      // server root. However, *other* Apollo Server packages host it at
      // /graphql. Optionally provide this to match apollo-server.
      path: '/'
    });
  
    const port = process.env.PORT || 4000;
    await new Promise(resolve => httpServer.listen({port}, resolve));
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers);
