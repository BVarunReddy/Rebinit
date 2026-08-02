const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const {
  getCollectionPoints,
  getGeoReports,
  createCollectionPoint,
  updateCollectionPoint,
  deleteCollectionPoint,
} = require("../controllers/map.controller");

router.get("/collection-points", verifyToken, getCollectionPoints);
router.get("/reports", verifyToken, getGeoReports);
router.post(
  "/collection-points",
  verifyToken,
  requireRole("admin"),
  createCollectionPoint,
);
router.patch(
  "/collection-points/:id",
  verifyToken,
  requireRole("admin"),
  updateCollectionPoint,
);
router.delete(
  "/collection-points/:id",
  verifyToken,
  requireRole("admin"),
  deleteCollectionPoint,
);

module.exports = router;
