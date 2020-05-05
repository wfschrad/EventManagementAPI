const express = require('express');
//const bodyParser = require('body-parser');
const graphQLAPI = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user')

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

        type User {
            _id: ID!
            email: String!
            password: String
        }
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }


        input UserInput {
            email: String!
            password:String!
        }
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),

    //resolvers

    rootValue: {
        events: async () => {
            try {
                const events = await Event.find();
                debugger
                return events.map(event => ({ ...event._doc, _id: event.id }))
            } catch (e) {
                console.log(e);
                throw e;
            }
        },
        createEvent: async ({ eventInput }) => {
            // const event = {
            //     _id: Math.random().toString(),
            //     title: eventInput.title,
            //     description: eventInput.description,
            //     price: +eventInput.price,
            //     date: eventInput.date
            // }
            const event = new Event({
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: new Date(eventInput.date),
                creator: '5c0f'
            });
            try {
                const res = await event.save();
                console.log('createEventRes', res);
                const creator = await User.findById
                return res;
            } catch (e) {
                console.log(e)
                throw e;
            }
            // events.push(event);
            // return event;
        },
        createUser: async ({ userInput }) => {
            try {
                const existingUser = await User.findOne({ email: userInput.email })
                if (existingUser) throw new Error('User already exists');

                //make new user

                const hashedPass = await bcrypt.hash(userInput.password, 12)
                const user = new User({
                    email: userInput.email,
                    password: hashedPass
                });
                const res = await user.save();
                console.log("RESULT", res)
                return { ...res._doc, _id: res.id, password: null };
            } catch (e) {
                console.log(e);
                throw e;
            }
        },
    },
    graphiql: true
}))


const port = 8081;
(async () => {
    try {
        console.log('pass', process.env.MONGO_PASS)
        await mongoose.connect(`
            mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-cakp0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority
        `)
        app.listen(port, () => console.log(`Now Listening on port ${port}...`));
    }
    catch (e) { console.log('ERROR:', e); console.log('Error Message:', e.message); }
})();