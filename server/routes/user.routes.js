const express = require("express");
const {
  handleGoogleSignInController,
} = require("../controllers/user.controller");
const router = express.Router();

router.post("/userSignIn", handleGoogleSignInController);

module.exports = router;
