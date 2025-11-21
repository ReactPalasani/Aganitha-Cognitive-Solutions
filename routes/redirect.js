import express from "express";
import { db } from "../db.js";

const router = express.Router();
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

router.get("/:code", async (req, res) => {
  const { code } = req.params;

  if (!CODE_REGEX.test(code)) {
    return res.status(404).send("Not found");
  }

  const result = await db.query(
    `UPDATE links
     SET total_clicks = total_clicks + 1,
         last_clicked = now()
     WHERE code = $1
     RETURNING target`,
    [code]
  );

  if (result.rowCount === 0) {
    return res.status(404).send("Not found");
  }

  res.redirect(302, result.rows[0].target);
});

export default router;
