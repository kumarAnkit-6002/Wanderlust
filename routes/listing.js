const express = require("express");
const router = express.Router();
const listingController = require("../controller/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer  = require('multer')
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage: storage })


router.route("/").get(wrapAsync(listingController.index))
.post(isLoggedIn,  upload.single('listing[image]'),validateListing, wrapAsync(listingController.createListing));
// .post( upload.single('listing[image]'),(req, res) => {
//   res.send(req.file);
// });
//index route
//router.get("/", wrapAsync(listingController.index));
//create new
router.get("/new", isLoggedIn, listingController.renderNewForm);
//make route
//router.post("/", validateListing, isLoggedIn, wrapAsync(listingController.createListing));
//editform
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

router.route("/:id")
.put(isLoggedIn,isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
.get(wrapAsync(listingController.showListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));
//update route
//router.put("/:id", validateListing, isOwner, wrapAsync(listingController.updateListing));
//show route
//router.get("/:id", wrapAsync(listingController.showListing));
//delete route
//router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
