const User=require("../models/user.js");

module.exports.renderSignupForm=(req,res)=>{
   res.render("users/signup");
}

module.exports.signup=async(req,res)=>{
    try{
    let {username,email,password}=req.body;
    let user=new User({username,email});
    let registeredUser=await User.register(user,password);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
         } 
    req.flash("success","Successfully signed up");
    res.redirect("/listings");
        })
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}
module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust");
    const redirectUrl = res.locals.saveUrl || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
};