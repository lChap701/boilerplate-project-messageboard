require("dotenv").config();
const crud = require("../crud");
const bcrypt = require("bcryptjs");

/**
 * Module that handles HTTP requests for /api/replies
 * @module ./controllers/replies
 *
 */
module.exports = class ReplyController {
  /**
   * Gets all replies for a thread during GET requests
   * @param {*} thread    Represents the thread to search for
   * @param {*} res       Represents the response
   *
   */
  static getReplies(thread, res) {
    crud.getReplies(thread).then((replies) => {
      replies.sort((a, b) => b.created_on - a.created_on);
      res.json({
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        replies: replies.map((reply) => {
          return {
            _id: reply._id,
            text: reply.text,
            created_on: reply.created_on,
          };
        }),
      });
    });
  }

  /**
   * Saves a new reply in the DB during POST requests
   * @param {*} thread    Represents the thread that will contain the reply
   * @param {*} data      Represents the reply to save
   * @param {*} res       Represents the response
   *
   */
  static postReply(thread, data, res) {
    crud
      .addReply(data)
      .then((reply) => {
        thread.replies.push(reply);
        thread.bumped_on = reply.created_on;
        thread.save();

        // For testing purposes
        if (process.env.NODE_ENV == "test") {
          res.json(thread);
        } else {
          res.redirect("/b/" + thread.board.name + "/" + thread._id);
        }
      })
      .catch((e) => {
        console.log(JSON.stringify(e.errors));
        Object.keys(e.errors).forEach((field) => {
          if (e.errors[field]) res.send(e.errors[field].message);
        });
      });
  }

  /**
   * Updates a reply during PUT requests
   * @param {*} thread      Represents the thread
   * @param {String} id     Represents the ID of the reply
   * @param {*} res         Represents the response
   *
   */
  static putReply(thread, id, res) {
    crud.getReplies(thread).then((replies) => {
      if (replies.filter((reply) => reply._id == id).length > 0) {
        crud.reportReply(id).then(() => res.send("success"));
      } else {
        res.send("reply was not found in thread " + thread.name);
      }
    });
  }

  /**
   * Deletes a reply during DELETE requests
   * @param {*} thread    Represents the thread
   * @param {*} data      Represents the data to use for deletion
   * @param {*} res       Represents the response
   *
   */
  static deleteReply(thread, data, res) {
    crud.getReplies(thread).then((replies) => {
      if (replies.filter((reply) => reply._id == data.reply_id).length == 0) {
        res.send("reply was not found in thread " + thread.name);
        return;
      }

      crud.getReply(data.reply_id).then((reply) => {
        if (bcrypt.compareSync(data.delete_password, reply.delete_password)) {
          crud.removeReplyText(data.reply_id).then(() => res.send("success"));
        } else {
          res.send("incorrect password");
        }
      });
    });
  }
};
