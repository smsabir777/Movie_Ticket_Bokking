const mongoose = require('mongoose')

async function initDB() {
  try {
    
    mongoose.set('strictQuery', false)
    await mongoose.connect(process.env.MONGO_URL, { dbName: 'Ticket-Booking' })
    console.log("Connected to DB Successfully")
  } catch (err) {
    console.log("Error connecting to DB")
  }
}

module.exports = {
  initDB
}