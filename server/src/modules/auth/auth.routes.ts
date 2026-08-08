import { Router } from "express";
import { register, login, getMe, updateMe, changePassword, logout } from "./auth.controller.js";
import { presignAvatar, saveAvatar, proxyUpload } from "../uploads/uploads.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);
router.post("/change-password", authenticate, changePassword);

// Avatar uploads (any authenticated user)
router.post("/presign-avatar", authenticate, presignAvatar);
router.post("/save-avatar", authenticate, saveAvatar);
router.put("/proxy", authenticate, proxyUpload);

export default router;
