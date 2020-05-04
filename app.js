const express = require('express');
//const bodyParser = require('body-parser');
const graphQLAPI = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
app.use(express());

//temporary to replace DB

const events = [];

//routes

app.use('/api', graphQLAPI({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    //resolvers

    rootValue: {
        events: () => events,
        createEvent: ({ eventInput }) => {
            const event = {
                _id: Math.random().toString(),
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: eventInput.date
            }
            events.push(event);
            return event;
        },
    },
    graphiql: true
}))


const port = 8081;

app.listen(port, () => console.log(`Now Listening on port ${port}...`));