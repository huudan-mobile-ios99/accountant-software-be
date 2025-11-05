const express = require("express");
const router = express.Router();
const dboperation = require("../dboperation");

// ✅ GET /api/v1/customer/list_customer?page=1&limit=100
router.get("/list_customer", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const result = await dboperation.getListCustomerForAccountantSoftware(page, limit);
    res.json(result);
  } catch (err) {
    console.error("error get list customer:", err);
    next(err);
  }
});

// ✅ GET /api/v1/customer/gaming_date_customer?date=2025-11-04
router.get("/gaming_date_customer", async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameter: date",
      data: [],
    });
  }

  try {
    const result = await dboperation.getCustomersByGamingDate(date);
    res.json(result);
  } catch (err) {
    console.error("Error in gaming_date_customer route:", err);
    next(err);
  }
});

module.exports = router;
