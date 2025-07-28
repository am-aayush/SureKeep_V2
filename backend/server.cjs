const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { nanoid } = require('nanoid');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:5173', // React app
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

let db, collection;
MongoClient.connect(process.env.MONGO_URI)
  .then(client => {
    db = client.db('SureKeep_V2');
    collection = db.collection('data');
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error(err));

const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Signup
app.post('/user/signup', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await collection.findOne({ username });
  if (existingUser) return res.status(409).status({ message: "User already exists" });

  await collection.insertOne({ username, password });
  res.status(201).json({ message: "User created" });
});

// Login
app.post('/user/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await collection.findOne({ username, password });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const token = generateToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: false,
    maxAge: 60 * 60 * 1000 // 1 hour
  });
  res.status(200)
  res.json({ username: user.username, id: user._id });
});

//Making Collection
app.post('/user/collection', async (req, res) => {
  const { userId, collectionName } = req.body;
  if (!ObjectId.isValid(userId)) {
    console.log('Invalid ID:', userId);
    return res.status(400).json({ message: 'Invalid ID' });
  }
  const objectId = ObjectId.createFromHexString(userId);
  try {
    const existingUser = await collection.findOne({ _id: objectId });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Create new data entry
    const newEntry = {
      [collectionName]: {
        "id": nanoid(7),
        "data": []
      }
    };
    // Push new data into the user's `data` array
    await collection.updateOne(
      { _id: objectId },
      { $set: newEntry }
    );
    return res.status(200).json({ message: 'Entry added successfully', newEntry });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


//Data Insertion to specific user And their Collection
app.post('/user/data/', async (req, res) => {
  const { userId, collectionId, url, username, password } = req.body;
  if (!ObjectId.isValid(userId)) {
    console.log('Invalid ID:', userId);
    return res.status(400).json({ message: 'Invalid ID' });
  }
  const objectId = ObjectId.createFromHexString(userId);
  try {
    const existingUser = await collection.findOne({ _id: objectId });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }


    // 🔍 Search for collection within user's nested keys
    let matchedCollectionKey = null;
    for (const key in existingUser) {
      if (typeof existingUser[key] === 'object' && existingUser[key]?.id === collectionId) {
        matchedCollectionKey = key;
        break;
      }
    }
    if (!matchedCollectionKey) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    const existingCollection = existingUser[matchedCollectionKey];
    // ✅ Now you can use existingCollection to modify or read its data
    // For example, pushing new data:
    existingCollection.data.push({ dataId: nanoid(10), url, username, password });

    // Then update the user document in the database
    await collection.updateOne(
      { _id: objectId },
      { $set: { [`${matchedCollectionKey}.data`]: existingCollection.data } }
    );
    const e = await collection.findOne({ _id: objectId });
    res.status(200).json({ message: 'Data added successfully' });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

//Edit Data 
app.put('/user/update', async (req, res) => {
  const { userId, collectionId, dataId, url, username, password } = req.body;

  if (!userId || !collectionId || !dataId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!ObjectId.isValid(userId)) {
    console.log('Invalid ID:', userId);
    return res.status(400).json({ message: 'Invalid ID' });
  }
  const objectId = ObjectId.createFromHexString(userId);
  try {
    const user = await collection.findOne({ _id: objectId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find OLD collection where the credential currently exists
    let oldCollectionKey = null;
    for (const key of Object.keys(user)) {
      if (typeof user[key] === 'object' && user[key]?.data) {
        const found = user[key].data.find(item => item.dataId === dataId);
        if (found) {
          oldCollectionKey = key;
          break;
        }
      }
    }

    if (!oldCollectionKey) {
      return res.status(404).json({ message: "Original credential not found." });
    }

    // Find the NEW collection key from the incoming collectionId
    const newCollectionKey = Object.keys(user).find(
      key => typeof user[key] === 'object' && user[key]?.id === collectionId
    );

    if (!newCollectionKey) {
      return res.status(404).json({ message: "Target collection not found." });
    }

    // ✅ CASE 1: Same collection → update in-place
    if (oldCollectionKey === newCollectionKey) {
      const result = await collection.updateOne(
        {
          _id: objectId,
          [`${newCollectionKey}.data.dataId`]: dataId
        },
        {
          $set: {
            [`${newCollectionKey}.data.$.url`]: url,
            [`${newCollectionKey}.data.$.username`]: username,
            [`${newCollectionKey}.data.$.password`]: password
          }
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(400).json({ message: "Update failed. Credential not found." });
      }

      return res.json({ message: "Credential updated successfully" });
    }

    // ✅ CASE 2: Collection changed → remove from old, add to new
    const updatedData = { dataId, url, username, password };

    // Remove from old collection
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { [`${oldCollectionKey}.data`]: { dataId } } }
    );

    // Push to new collection
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { [`${newCollectionKey}.data`]: updatedData } }
    );

    return res.json({ message: "Credential moved and updated successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//Delete the data
app.delete('/user/delete', async (req, res) => {
  const { userId, collectionId, dataId } = req.body;

  if (!userId || !collectionId || !dataId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!ObjectId.isValid(userId)) {
    console.log('Invalid ID:', userId);
    return res.status(400).json({ message: 'Invalid ID' });
  }
  const objectId = ObjectId.createFromHexString(userId);
  try {
    const user = await collection.findOne({ _id: objectId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the key that matches the collectionId
    const collectionKey = Object.keys(user).find(
      key => typeof user[key] === 'object' && user[key]?.id === collectionId
    );

    if (!collectionKey) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Remove the credential by dataId from that collection
    const result = await collection.updateOne(
      { _id: objectId },
      { $pull: { [`${collectionKey}.data`]: { dataId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Credential not found or already deleted" });
    }

    return res.json({ message: "Credential deleted successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//Deleting the Collection 
app.delete('/user/deleteCollection', async (req, res) => {
  const { userId, collectionId } = req.body;

  if (!userId || !collectionId) {
    return res.status(400).json({ message: "Missing userId or collectionId" });
  }
  if (!ObjectId.isValid(userId)) {
    console.log('Invalid ID:', userId);
    return res.status(400).json({ message: 'Invalid ID' });
  }
  const objectId = ObjectId.createFromHexString(userId);
  try {
    const user = await collection.findOne({ _id: objectId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the key for the collection
    const collectionKey = Object.keys(user).find(
      key => typeof user[key] === 'object' && user[key]?.id === collectionId
    );

    if (!collectionKey) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Use $unset to delete the entire field (collectionKey)
    const result = await collection.updateOne(
      { _id: objectId },
      { $unset: { [collectionKey]: "" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to delete collection" });
    }

    return res.json({ message: "Collection deleted successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


//Getting Collection 
app.get('/get/collection/:id', async (req, res) => {
  const userId = req.params.id;
  const objectId = ObjectId.createFromHexString(userId);
  const existingUser = await collection.findOne({ _id: objectId });
  res.json(existingUser)
});


//Getting data 
app.get('/get/data/:id/:collectionId', async (req, res) => {
  const userId = req.params.id;
  const collectionId = req.params.collectionId;
  if (!ObjectId.isValid(userId)) {
    console.log('Invalid ID:', userId);
    return res.status(400).json({ message: 'Invalid ID' });
  }
  const objectId = ObjectId.createFromHexString(userId);
  try {
    const existingUser = await collection.findOne({ _id: objectId });
    console.log("Existing User\n", existingUser);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let matchedCollectionKey = null;
    for (const key in existingUser) {
      if (typeof existingUser[key] === 'object' && existingUser[key]?.id === collectionId) {
        matchedCollectionKey = key;
        break;
      }
    }
    if (!matchedCollectionKey) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    const existingCollection = existingUser[matchedCollectionKey];
    console.log("Existing Collection\n", existingCollection);
    res.json(existingCollection.data)
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }

});


// Logout
app.post('/user/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out" });
});

// Protected route
app.get('/user/me', authMiddleware, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
