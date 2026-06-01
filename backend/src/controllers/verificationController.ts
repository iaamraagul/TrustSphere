import { Request, Response } from "express";

import Verification from "../models/Verification";

import { createAuditLog } from "../services/auditService";

export const createVerification = async (req: Request, res: Response) => {
  try {
    const verification = await Verification.create(req.body);

    await createAuditLog(
      "SYSTEM",
      "CREATE_VERIFICATION",
      verification._id.toString(),
      {
        verificationType: verification.verificationType,
      },
    );

    res.status(201).json({
      message: "Verification created",
      verification,
    });
  } catch (verificationError) {
    console.error(verificationError);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getVerifications = async (req: Request, res: Response) => {
  try {
    const verifications = await Verification.find()
      .populate("userId", "name email role")
      .sort({
        createdAt: -1,
      });

    res.json(verifications);
  } catch (verificationLookupError) {
    console.error(verificationLookupError);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const processVerification = async (req: Request, res: Response) => {
  try {
    const { id, delay } = req.body;

    const verification = await Verification.findById(id);

    if (!verification) {
      return res.status(404).json({
        message: "Verification not found",
      });
    }

    verification.status = "VALIDATING";

    verification.remarks = "Validation process started";

    await verification.save();

    await createAuditLog(
      "SYSTEM",
      "VALIDATION_STARTED",
      verification._id.toString(),
    );

    setTimeout(async () => {
      verification.status = "BACKGROUND_CHECK";

      verification.remarks = "Background check in progress";

      await verification.save();

      await createAuditLog(
        "SYSTEM",
        "BACKGROUND_CHECK_STARTED",
        verification._id.toString(),
      );

      setTimeout(async () => {
        verification.status = "APPROVED";

        verification.processingTime = delay;

        verification.confidenceScore = Math.floor(Math.random() * 20) + 80;

        verification.riskLevel =
          verification.confidenceScore > 90 ? "LOW" : "MEDIUM";

        verification.remarks = "Verification completed successfully";

        await verification.save();

        await createAuditLog(
          "SYSTEM",
          "VERIFICATION_COMPLETED",
          verification._id.toString(),
          {
            confidenceScore: verification.confidenceScore,
            riskLevel: verification.riskLevel,
          },
        );
      }, delay);
    }, 3000);

    res.json({
      message: "Verification processing started",
    });
  } catch (processingError) {
    console.error(processingError);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
