const mongoose = require('mongoose');
const Board = require('./src/models/Board');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateBoards() {
  try {
    // Find all boards that don't have project field populated
    const boards = await Board.find({ project: { $exists: false } });
    
    console.log(`Found ${boards.length} boards without project field`);
    
    // Update each board to include the project reference
    for (let board of boards) {
      if (board.project) {
        console.log(`Board ${board.name} already has project field`);
        continue;
      }
      
      // Update board to include project reference
      await Board.findByIdAndUpdate(board._id, { 
        $set: { project: board.project }
      });
      
      console.log(`Updated board ${board.name} with project reference`);
    }
    
    console.log('Board update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating boards:', error);
    process.exit(1);
  }
}

updateBoards();
