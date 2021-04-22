const Discussion = require("../models/Discussion.model");

module.exports = (req, res, next) => {
  const dynamicDiscussion = req.params.dynamicDiscussion;
  const owner = req.session.user._id;
  Discussion.findById(dynamicDiscussion)
    .then((result) => {
      console.log("req.params: ", req.params.dynamicDiscussion);
      console.log("result: ", result);
      if (!result) {
        return res.redirect(`/community/${req.params.dynamicCommunity}`);
      }
      if (!(result.createdBy == owner)) {
        return res.redirect(
          `/community/${req.params.dynamicCommunity}/discussion/${req.params.dynamicDiscussion}`
        );
      }
      next();
      return;
    })
    .catch(() => {
      return res.redirect(`/community/${req.params.dynamicCommunity}`);
    });

  //   Discussion.findOne({
  //     $and: [
  //       { _id: req.params.dynamicDiscussion },
  //       { createdBy: req.session.user._id },
  //     ],
  //   })
  //     .then((result) => {
  //       console.log("result: ", result);
  //       if (!result) {
  //         return res.redirect(
  //           `/community/${req.params.dynamicCommunity}/discussion/${req.params.dynamicDiscussion}`
  //         );
  //       }
  //       next();
  //       return;
  //     })
  //     .catch(() => {
  //       return res.redirect(`/community/${req.params.dynamicCommunity}`);
  //     });
};
