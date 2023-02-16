const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.mongo_URL).then(
    () => { console.log('Database is connected') },
)
    .catch((err) => {
    console.log('could not connect to database'+ err);
});