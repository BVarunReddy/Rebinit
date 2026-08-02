const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  getMyNotifications,
  markAllRead,
  markOneRead,
  getUnreadCount,
} = require("../controllers/notifications.controller");
router.get("/", verifyToken, getMyNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.patch("/mark-read", verifyToken, markAllRead);
router.patch("/:id/read", verifyToken, markOneRead);
module.exports = router;
