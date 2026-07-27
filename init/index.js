const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
require("dotenv").config({ path: "../.env" });


main()
.then(()=>{
    console.log("connected to db");
    
}).catch((err)=>{
    console.log(err);
})

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6a676753b5e782defd760527" }));
   await Listing.insertMany(initData.data);
    console.log("data is initialized");
};
initDB();
