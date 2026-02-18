const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('candidates');
    
    // List indexes to confirm name
    const indexes = await collection.indexes();
    console.log('Current Indexes:', indexes);

    const emailIndex = indexes.find(idx => idx.key.email === 1);
    
    if (emailIndex) {
      console.log(`Dropping index: ${emailIndex.name}`);
      await collection.dropIndex(emailIndex.name);
      console.log('Index dropped successfully');
    } else {
      console.log('Email index not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndex();
