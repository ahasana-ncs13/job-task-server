const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.j6dmigp.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const BookNestDB = client.db("BookNestDB");
    const booksCollection = BookNestDB.collection("allbooks");

    // latest books get api 
    app.get("/latestbooks", async (req, res) => {
      const cursor = booksCollection.find({}).limit(8).sort({createdAt:-1}).project({description:0,format:0,pages:0,publisher:0,publishedYear:0,ISBN:0});
      const latestBooks = await cursor.toArray();
      res.send(latestBooks);
    });

    // all books get api 
    app.get("/allbooks", async (req, res) => {
      const cursor = booksCollection.find({});
      const allBooks = await cursor.toArray();
      res.send(allBooks);
    });

    // bookdetails get api 
    app.get("/bookdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const bookDetails = await booksCollection.findOne(query);
      res.send(bookDetails);
    });

    // addbooks post api 
    app.post("/addbooks", async (req, res) => {
      const NewBook = req.body;
      const newissue = {
        ...NewBook,
        createdAt: new Date(),
      };

      const addBooks = await booksCollection.insertOne(newissue);
      res.send(addBooks);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("BookNest server is running");
});

app.listen(port, () => {
  console.log(`BookNest server app listening on port ${port}`);
});
