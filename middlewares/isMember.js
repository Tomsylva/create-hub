const Community = require("../models/Community.model");

module.exports = (req, res, next) => {
  Community.find({
    $and: [
      { slug: req.params.dynamicCommunity },
      { members: { $in: req.session.user._id } },
    ],
  })
    .then((result) => {
      next();
      return;
    })
    .catch(res.redirect("/"));
};
