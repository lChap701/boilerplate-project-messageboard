require("dotenv").config();
const crud = require("../crud");
const bcrypt = require("bcryptjs");

/**
 * Module that handles HTTP requests for /api/threads
 * @module ./controllers/threads
 *
 */
module.exports = class ThreadController {
  /**
   * Gets up to 10 threads and 3 replies during GET requests
   * @param {*} board     Represents the board to search for
   * @param {*} res       Represents the response
   *
   */
  static getThreads(board, res) {
    crud.getThreads(board).then((threads) => {
      let results = threads
        .sort((a, b) => b.bumped_on - a.bumped_on)
        .slice(0, 10);

      results.forEach((thread, i) => {
        crud.getReplies(thread).then((replies) => {
          let replyResults = replies
            .sort((a, b) => b.created_on - a.created_on)
            .slice(0, 3);

          if (i == results.length - 1) {
            res.json(
              results.map((result) => {
                return {
                  _id: result._id,
                  text: result.text,
                  created_on: result.created_on,
                  replycount: result.replies.length,
                  replies: replyResults.map((reply) => {
                    return {
                      _id: reply._id,
                      text: reply.text,
                      created_on: reply.created_on,
                    };
                  }),
                };
              })
            );
          }
        });
      });
    });
  }

  /**
   * Saves a new thread in the DB during POST
   * @param {*} board     Represents the board that will contain the thread
   * @param {*} data      Represents the thread to save
   * @param {*} res       Represents the response
   *
   */
  static postThread(board, data, res) {
    crud
      .addThread(data)
      .then((thread) => {
        board.threads.push(thread);
        board.save();
        res.json(thread);
      })
      .catch((e) => {
        console.log(JSON.stringify(e.errors));
        Object.keys(e.errors).forEach((field) => {
          if (e.errors[field]) res.send(e.errors[field].message);
        });
      });
  }

  /**
   * Updates a thread during PUT requests
   * @param {*} board       Represents the board
   * @param {String} id     Represents the ID of the thread
   * @param {*} res         Represents the response
   *
   */
  static putThread(board, id, res) {
    crud.getThreads(board).then((threads) => {
      if (threads.filter((thread) => thread._id == id).length > 0) {
        crud.reportThread(id).then(() => res.send("success"));
      } else {
        res.send("thread was not found in board " + board.name);
      }
    });
  }

  /**
   * Deletes a thread during DELETE requests
   * @param {*} board     Represents the board
   * @param {*} data      Represents the data to use for deletion
   * @param {*} res       Represents the response
   *
   */
  static deleteThread(board, data, res) {
    crud.getThreads(board).then((threads) => {
      if (
        threads.filter((thread) => thread._id == data.thread_id).length == 0
      ) {
        res.send("thread was not found in board " + board.name);
        return;
      }

      crud.getThread(data.thread_id).then((thread) => {
        if (bcrypt.compareSync(data.delete_password, thread.delete_password)) {
          crud.deleteThread(data.thread_id).then(() => {
            board.threads = board.threads.filter(
              (thread) => thread._id != data.thread_id
            );
            board.save();
            res.send("success");
          });
        } else {
          res.send("incorrect password");
        }
      });
    });
  }
};
