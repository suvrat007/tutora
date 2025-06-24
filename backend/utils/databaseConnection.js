const mongoose = require('mongoose');

const connectDb = async () => {
    await mongoose.connect(process.env.VITE_MONGO_URI);
}

module.exports={connectDb};
