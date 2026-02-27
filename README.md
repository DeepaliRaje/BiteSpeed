## Contact Identity Reconciliation API 

A backend service built with Node.js, Express, and MongoDB that identifies and links customer contacts based on email and phone number.
It consolidates multiple records into a single primary contact with related secondary contacts.

## Tech Stack

Node.js

Express.js

MongoDB

Mongoose

dotenv

## Project Structure
├── controllers/
├── models/
│   └── Contact.js
├── routes/
│   └── identify.js
├── .env
├── server.js
└── README.md

## Environment Variables

Create a .env file in the root directory:
``` bash
  PORT=3000
  MONGO_URI=your_mongodb_connection_string
```

## Installation
npm install

## Run the Server
node server.js

## Contact Schema

phoneNumber (String)

email (String)

linkedId (ObjectId)

linkPrecedence ("primary" | "secondary")

createdAt (Date)

updatedAt (Date)

deletedAt (Date)

## Features

Identity reconciliation logic

Primary & secondary contact linking

RESTful API structure

MVC architecture
