const Community = require("../models/Community.model");

module.exports = (req, res, next) => {
  Community.findOne({
    $and: [
      { slug: req.params.dynamicCommunity },
      { members: { $in: req.session.user._id } },
    ],
  })
    .then((result) => {
      console.log("result: ", result);
      if (!result) {
        return res.redirect(`/community/${req.params.dynamicCommunity}`);
      }
      next();
      return;
    })
    .catch(() => {
      res.redirect("/");
    });
};
