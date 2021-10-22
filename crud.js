require("dotenv").config();
const mongoose = require("mongoose");

// Connects to database
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const Schema = mongoose.Schema;
const boardSchema = new Schema({
  name: { type: String, trim: true, required: "{PATH} is required" },
  threads: [{ type: Schema.Types.ObjectId, ref: "Threads" }],
});
const threadSchema = new Schema(
  {
    text: { type: String, trim: true, required: "{PATH} is required" },
    delete_password: {
      type: String,
      trim: true,
      required: "{PATH} is required",
    },
    reported: { type: Boolean, default: false },
    replies: [{ type: Schema.Types.ObjectId, ref: "Replies" }],
    board: { type: Schema.Types.ObjectId, ref: "Boards" },
    bumped_on: { type: Date },
  },
  {
    timestamps: {
      createdAt: "created_on",
      updatedAt: false,
    },
  }
);
const replySchema = new Schema(
  {
    text: { type: String, trim: true, required: "{PATH} is required" },
    delete_password: {
      type: String,
      trim: true,
      required: "{PATH} is required",
    },
    reported: { type: Boolean, default: false },
    thread: { type: Schema.Types.ObjectId, ref: "Threads" },
  },
  {
    timestamps: {
      createdAt: "created_on",
      updatedAt: false,
    },
  }
);

// Models
const Boards = mongoose.model("Boards", boardSchema);
const Threads = mongoose.model("Threads", threadSchema);
const Replies = mongoose.model("Replies", replySchema);

/**
 * Module for running CRUD operations once connected to the DB
 * @module ./crud
 *
 */
const crud = {
  addBoard: (data) => new Boards(data).save(),
  addThread: (data) => new Threads(data).save(),
  addReply: (data) => new Replies(data).save(),
  getBoard: (board) => Boards.findOne({ name: board }),
  getThread: (id) => Threads.findOne({ _id: id }),
  getReply: (id) => Replies.findOne({ _id: id }),
  getThreads: (board) => Threads.find({ board: board }),
  getReplies: (thread) => Replies.find({ thread: thread }),
  reportThread: (id) => Threads.updateOne({ _id: id }, { reported: true }),
  reportReply: (id) => Replies.updateOne({ _id: id }, { reported: true }),
  removeReplyText: (id) =>
    Replies.updateOne({ _id: id }, { text: "[deleted]" }),
  deleteBoard: (id) => Boards.deleteOne({ _id: id }),
  deleteThread: (id) => Threads.deleteOne({ _id: id }),
  deleteReply: (id) => Replies.deleteOne({ _id: id }),
};

module.exports = crud;
