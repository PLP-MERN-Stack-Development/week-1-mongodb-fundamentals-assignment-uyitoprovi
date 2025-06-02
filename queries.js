require('dotenv').config();

const { MongoClient } = require('mongodb');

// connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Database and collections 

const dbname = 'plp_bookstore';
const collectionName = 'books';

async function run() {

  try{
    await client.connect();
    console.log('connected to MongoDb server');

    const db = client.db(dbname);
    const collection = db.collection(collectionName);

     // New book to insert
    const newBook = {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      genre: "Psychological Thriller",
      published_year: 2019,
      rating: 4.1
    };
    const result = await collection.insertOne(newBook);
    console.log("New book inserted with _id:", result.insertedId);

    
    // 1. find All books
    const booksCursor = await collection.find().toArray();
    console.log("Display the all books:", booksCursor);
    
   // 2. Find books by a specific author:

   const author = 'George Orwell';
   const findByAuthor = await collection.find({ author: author }).toArray();
   console.log(`Books by author: ${author}`,findByAuthor);

  // 3. Find books published after 1950:
  const publishedafter1950 = await collection.find({ published_year: { $gt: 1950 } }).toArray();
  console.log("Books published after 1950:", publishedafter1950);

  // 4. Find books in a specific genre:
  const genre = await collection.find({ genre: "Fiction" }).toArray();
  console.log("Books with Friction genre : ", genre);

  // 5. Find in-stock books:
  const booksInStock = await collection.find({ in_stock: true }).toArray();
  console.log("Books that are in stock : ", booksInStock);
  // 6. Projection (only title and author)
  const projectedBooks = await collection.find({}, { projection: { _id: 0, title: 1, author: 1 } }).toArray();
  console.log("only title and author: ",projectedBooks);
  // 7. Find books sorted by published_year descending
  const sortedBooks = await collection.find().sort({ published_year: -1 }).toArray();
  console.log("Books sorted by published year descending: ", sortedBooks);
  // 8. Group books by genre and count
  const genreCounts = await collection.aggregate([{ $group: { _id: "$genre", count: { $sum: 1 } } }]).toArray();
  console.log("Group books by genre and count: ",genreCounts);
   // 9. UPDATE ONE BOOK: Change the title of one specific book
   const updateOneResult = await collection.updateOne({ title: "1984" },{ $set: { title: "Nineteen Eighty-Four" } });
  console.log(`Updated ${updateOneResult.modifiedCount} document (updateOne).`);

  // 10. UPDATE MANY BOOKS: Add a `category` to all books published before 1960
  const updateManyResult = await collection.updateMany({ published_year: { $lt: 1960 } },{ $set: { category: "Classic Literature" } });
  console.log(`Updated ${updateManyResult.modifiedCount} documents (updateMany).`);

  // 12. DELETE ONE BOOK: Delete one book by a specific author
  const deleteOneResult = await collection.deleteOne({ author: "Unknown Author" });
  console.log(`Deleted ${deleteOneResult.deletedCount} document (deleteOne).`);

  // 13. DELETE MANY BOOKS: Remove all books with rating below 3
  const deleteManyResult = await collection.deleteMany({ rating: { $lt: 2 } });
  console.log(`Deleted ${deleteManyResult.deletedCount} documents (deleteMany).`);

  // 14. Match books with rating >= 4 and only show title & author
    const pipeline = [
      {
        $match: {
          rating: { $gte: 4 }
        }
      },
      {
        $project: {
          _id: 0,
          title: 1,
          author: 1,
          rating: 1
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    console.log("Books with rating >= 4 (projecting title, author, rating):");
    console.log(results);

  // 14. Create an index on published_year and check indexes
  await collection.createIndex({ published_year: 1 });
  const indexes = await collection.indexes();
  console.log("index on published__year: ",indexes);
}catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
};
  run();