const router = require("express").Router();

router.get("/", (req,res) => {
	if (res.locals.IsAuthd) return res.render("dashboard", {title:"The Bin | Dashboard", page:"dashboard", user:res.locals.User});
	else return res.redirect("/");
});

module.exports = router;