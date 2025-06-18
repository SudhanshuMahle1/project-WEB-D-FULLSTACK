const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=> {
    console.log("connected to db");
}).catch(()=> {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
      await Listing.deleteMany({});
      initData.data = initData.data.map((obj) => ({
        ...obj,
        owner:"6776d181b8a92474886fd11c",
      }));
      await Listing.insertMany(initData.data);
      console.log("Data was initialized");
};

initDB();



// async function removeOwnerField() {
//     try {
//         await Listing.updateMany({}, { $unset: { owner: "" } });
//         console.log("Owner field removed from all documents.");
//     } catch (err) {
//         console.error("Error removing owner field:", err);
//     } finally {
//         mongoose.connection.close();
//     }
// }

// // Call the function
// removeOwnerField();
