const Listing=require("./models/listing.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingschema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.method === "GET") {
            req.session.redirectUrl = req.originalUrl;
        } else if (req.headers.referer) {
            req.session.redirectUrl = req.headers.referer;
        } else if (req.params && req.params.id) {
            req.session.redirectUrl = `/listings/${req.params.id}`;
        } else {
            req.session.redirectUrl = "/listings";
        }
        req.flash("error", "You must be logged in to access!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.saveUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner= async (req,res,next)=>{
    let {id}=req.params;
  let listing= await Listing.findById(id);
    
        if(!listing.owner.equals(res.locals.currentUser._id)){
            req.flash("error","You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }
        next();
    };

    module.exports. validateListing=(req,res,next)=>{
     let {error} =listingschema.validate(req.body);
            if(error){
                let errMsg=error.details.map((el)=>el.message).join(",");
                throw new ExpressError(400, errMsg);
            } else{
                next();
            }
    }

    module.exports. validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map(el => el.message)
            .join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};

module.exports.isAuthor= async (req,res,next)=>{
    let {id,reviewId}=req.params;
  let review= await Review.findById(reviewId);
    
        if(!review.author.equals(res.locals.currentUser._id)){
            req.flash("error","You are not the Author of this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
    };