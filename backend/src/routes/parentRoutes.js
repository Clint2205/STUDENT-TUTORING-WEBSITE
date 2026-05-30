// parentRoutes.js: This file defines the Express routes for parent-related functionalities. It includes routes for creating child accounts, listing children, retrieving child resources, and hiding specific resources from a child. All routes are protected by JWT authentication and require the user to have the "parent" role. The routes are connected to the corresponding controller functions defined in parentController.js.

import express from "express";
import { protect,requireRole } from "../middleware/auth.middleware.js"; // your JWT middleware

import {
  createChild,
  listChildren,
  getChildResources,
  hideChildResource,
  getChildProgress
} from "../controllers/parentController.js";


const router = express.Router();

router.use(protect);
router.use(requireRole("parent"));

router.post("/children", createChild);
router.get("/children", listChildren);
router.get("/children/:childUserId/resources", getChildResources);
router.get("/progress/:childUserId", getChildProgress);
router.post("/children/:childUserId/hide/:resourceId", hideChildResource);

export default router;