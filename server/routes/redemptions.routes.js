const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  getCatalog,
  redeemItem,
  getMyRedemptions,
} = require("../controllers/redemptions.controller");

router.get("/catalog", verifyToken, getCatalog);
router.post("/:catalogItemId", verifyToken, redeemItem);
router.get("/mine", verifyToken, getMyRedemptions);

module.exports = router;
