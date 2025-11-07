import express from "express";
import * as messagesController from "./message.controller.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

// Get available users for messaging - requires auth
router.get("/users", auth, messagesController.getAvailableUsers);

//Send a message
router.post("/send", messagesController.sendMessage);

  //Get conversation between two users
router.get("/conversation/:user1_id/:user2_id", messagesController.getConversation);

  //Get all conversations for a user
router.get("/conversations/:user_id", messagesController.getUserConversations);

  //Mark messages as read
router.put("/mark-read", messagesController.markAsRead);

  //Delete a message
router.delete("/:messageId", messagesController.deleteMessage);

export default router;

