const express = require("express");
const Auth = require("../middlewares/Auth");
const ValidateAdminMiddleware = require("../middlewares/ValidateAdminMiddleware");
const AdminController = require("../controllers/AdminController");

const router = express.Router();

// Fetch All Admins
router.get("/", Auth, AdminController.getAdmins);

// Create Admin (Only existing Admins can create new Admins)
router.post("/create", Auth, ValidateAdminMiddleware, AdminController.createAdmin);

// Update Admin Permissions
router.put("/update/:adminId", Auth, ValidateAdminMiddleware, AdminController.updateAdminPermissions);

// Delete Admin
router.delete("/delete/:adminId", Auth, AdminController.deleteAdmin);

module.exports = router;