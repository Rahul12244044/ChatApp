import messageModel from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiver, content,file } = req.body;
    console.log("req.body");
    console.log(req.body);
    const sender = req.user.id; 
if (req.user.id === req.body.receiver) {
  return res.status(400).json({ error: "Cannot send message to yourself." });
}

    if (!receiver || (!content && !file)) {
  return res.status(400).json({ msg: "Receiver and either content or file is required." });
}
    console.log("receiver: ");
    console.log(receiver);
    console.log("content: ");
    console.log(content);
    console.log("sender: ");
    console.log(sender);

    const message = await messageModel.create({ sender, receiver, content,file });
    console.log("message: ");
    console.log(message);
    res.status(201).json(message);
  } catch (err) {
    console.error("Send message error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const loggedInUser = req.user.id;

    const messages = await messageModel.find({
      $or: [
        { sender: loggedInUser, receiver: userId },
        { sender: userId, receiver: loggedInUser },
      ],
    })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
export const sennMessage=async (req, res) => {
  try {
    const fromUserId = req.params.fromUserId;
    const toUserId = req.user.id;

    await messageModel.updateMany(
      { sender: fromUserId, receiver: toUserId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update seen status" });
  }
}
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deleted = await messageModel.findByIdAndDelete(messageId);
    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json({ message: "Message deleted successfully", id: messageId });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting message", error: err.message });
  }
};
