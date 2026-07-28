const Listing = require("../models/listing");
const axios = require("axios");

const buildSearchQuery = (searchTerm) => {
    const normalizedSearch = searchTerm?.trim();

    if (!normalizedSearch) {
        return {};
    }

    const regex = new RegExp(normalizedSearch, "i");

    return {
        $or: [
            { title: regex },
            { location: regex },
            { country: regex },
        ],
    };
};

module.exports.buildSearchQuery = buildSearchQuery;

module.exports.index=async (req,res) => {
    const searchTerm = req.query.search?.trim() || "";
    const searchQuery = buildSearchQuery(searchTerm);
    const allListings = await Listing.find(searchQuery);
    res.render("listings/index.ejs",{allListings, searchTerm}); 
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing= async(req,res)=>{
    let {id}=req.params;
  const listing= await  Listing.findById(id)
  .populate({path: "reviews", populate: { path: "author" }})
  .populate("owner");
  if(!listing){
        req.flash("error","Cannot find that listing");
        return res.redirect("/listings");
    }
    
  res.render("listings/show.ejs",{listing})
}

module.exports.createListing = async (req, res, next) => {
    const query = `${req.body.listing.location}, ${req.body.listing.country}`;

    let result;

    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: query,
                    format: "json",
                    limit: 1,
                },
                headers: {
                    "User-Agent": "Wanderlust-App",
                },
            }
        );

        result = response.data[0];

        if (!result) {
            req.flash(
                "error",
                "Location not found. Please enter a valid location."
            );
            return res.redirect("/listings/new");
        }

        

    } catch (err) {

        if (err.response?.status === 429) {
            req.flash(
                "error",
                "Location service is temporarily busy. Please try again after a minute."
            );
            return res.redirect("/listings/new");
        }

        return next(err);
    }

    const url = req.file.path;
    const filename = req.file.filename;

    const listing = new Listing(req.body.listing);

    listing.owner = req.user._id;
    listing.image = {
        url,
        filename,
    };

    listing.geometry = {
        type: "Point",
        coordinates: [
            Number(result.lon),
            Number(result.lat),
        ],
    };

    await listing.save();

    req.flash("success", "Successfully made a new listing");
    res.redirect("/listings");
};

module.exports.renderEditForm= async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Cannot find that listing");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    // originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250"); // Replace backslashes with forward slashes
    res.render("listings/edit.ejs",{listing, originalImageUrl});
}

module.exports.updateListing = async (req, res, next) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for updating");
    }

    const { id } = req.params;

    // Get existing listing
    const oldListing = await Listing.findById(id);

    if (!oldListing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Check if location or country changed
    const locationChanged =
        oldListing.location !== req.body.listing.location ||
        oldListing.country !== req.body.listing.country;

    if (locationChanged) {
        const query = `${req.body.listing.location}, ${req.body.listing.country}`;

        try {
            const response = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        q: query,
                        format: "json",
                        limit: 1,
                    },
                    headers: {
                        "User-Agent": "Wanderlust-App",
                    },
                }
            );

            const result = response.data[0];

            if (!result) {
                req.flash(
                    "error",
                    "Location not found. Please enter a valid location."
                );
                return res.redirect(`/listings/${id}/edit`);
            }

            req.body.listing.geometry = {
                type: "Point",
                coordinates: [
                    Number(result.lon),
                    Number(result.lat),
                ],
            };

        } catch (err) {
            if (err.response?.status === 429) {
                req.flash(
                    "error",
                    "Location service is temporarily busy. Please try again after a minute."
                );
                return res.redirect(`/listings/${id}/edit`);
            }

            return next(err);
        }
    }

    // Update listing
    let listing = await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        { new: true, runValidators: true }
    );

    // Update image if a new image is uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };

        await listing.save();
    }

    req.flash("success", "Successfully updated the listing");
    res.redirect(`/listings/${id}`);
};
module.exports.deleteListing= async(req,res)=>{
    let {id}=req.params;
   await Listing.findByIdAndDelete(id);
   req.flash("success","Successfully deleted a listing");
   res.redirect("/listings");
}