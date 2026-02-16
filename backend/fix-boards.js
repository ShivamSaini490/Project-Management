const mongoose = require('mongoose');
const Board = require('./src/models/Board');

async function fixBoards() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    // Find boards without project field
    const boards = await Board.find({ project: { $exists: false } });
    console.log(`Found ${boards.length} boards without project field`);
    
    // Update each board to include project reference
    let updated = 0;
    for (const board of boards) {
      if (board.project) {
        console.log(`Board ${board.name} already has project field`);
        continue;
      }
      
      await Board.findByIdAndUpdate(board._id, { 
        $set: { project: board.project }
      });
      updated++;
      console.log(`Updated board ${board.name} with project reference`);
    }
    
    console.log(`Updated ${updated} boards successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating boards:', error);
    process.exit(1);
  }
}

fixBoards();
