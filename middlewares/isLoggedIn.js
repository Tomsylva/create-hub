module.exports = (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  if (!req.session.user) {
<<<<<<< HEAD
    return res.redirect("auth/login");
=======
    return res.redirect("/auth/login");
>>>>>>> tom-changes
  }
  req.user = req.session.user;
  next();
};
