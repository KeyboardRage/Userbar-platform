const router = require("express").Router();

router.get("/", (req,res) => {
	if (res.locals.IsAuthd) res.render("dashboard", {title:"The Bin | Dashboard", page:"dashboard", user:res.locals.User});
	else res.redirect("/");
});

module.exports = router;