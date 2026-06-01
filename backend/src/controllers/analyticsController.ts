import { Request, Response } from "express";

import User from "../models/User";
import Verification from "../models/Verification";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalVerifications = await Verification.countDocuments();

    const approvedVerifications = await Verification.countDocuments({
      status: "APPROVED",
    });

    const pendingVerifications = await Verification.countDocuments({
      status: {
        $in: ["QUEUED", "VALIDATING", "BACKGROUND_CHECK"],
      },
    });

    const highRiskCases = await Verification.countDocuments({
      riskLevel: "HIGH",
    });

    res.json({
      totalUsers,
      totalVerifications,
      approvedVerifications,
      pendingVerifications,
      highRiskCases,
    });
  } catch (analyticsError) {
    console.error(analyticsError);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
