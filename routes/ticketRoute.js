const express = require("express");
const router = express.Router();
const dboperation = require("../dboperation");


// ✅ GET /api/v1/ticket/ticket_transactions?date=2025-08-28&page=1&limit=100
router.get("/ticket_transactions", async (req, res, next) => {
  try {
    const gamingDate = req.query.date;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    if (!gamingDate) {
      return res.json({
        status: false,
        message: "date parameter is required (YYYY-MM-DD)",
        data: null
      });
    }

    const result = await dboperation.getTicketTransactionByGamingDate(
      gamingDate,
      page,
      limit
    );

    res.json(result);
  } catch (err) {
    console.error("error get ticket transactions:", err);
    next(err);
  }
});









// // ✅ GET /api/v1/ticket/ticket_redemptions?date=2026-01-05&page=1&limit=100
// router.get("/ticket_redemptions", async (req, res, next) => {
//   try {
//     const gamingDate = req.query.date;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 100;

//     if (!gamingDate) {
//       return res.json({
//         status: false,
//         message: "date parameter is required (YYYY-MM-DD)",
//         data: null
//       });
//     }

//     const result = await dboperation.getTicketRedemptionByGamingDate(
//       gamingDate,
//       page,
//       limit
//     );

//     res.json(result);
//   } catch (err) {
//     console.error("error get ticket redemptions:", err);
//     next(err);
//   }
// });
// ✅ GET /api/v1/ticket/tickets?date=2026-01-05&page=1&limit=100
router.get("/ticket_redemptions", async (req, res, next) => {
  try {
    const gamingDate = req.query.date;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    if (!gamingDate) {
      return res.json({
        status: false,
        message: "date parameter is required (YYYY-MM-DD)",
        data: null
      });
    }

    const result = await dboperation.getTicketRedemptionByGamingDate(
      gamingDate,
      page,
      limit
    );

    res.json(result);
  } catch (err) {
    console.error("error get tickets redemption:", err);
    next(err);
  }
});

module.exports = router;
