import express from "express";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/", getUsers);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
