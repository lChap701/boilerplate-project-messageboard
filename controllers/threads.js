require("dotenv").config();
const crud = require("../crud");
const bcrypt = require("bcrypt");
//const ObjectId = require("mongodb").ObjectId;

/**
 * Module that handles all HTTP requests for threads
 * @module ./controllers/threads
 *
 */
module.exports = class ThreadController {
  /**
   * Gets all threads for GET requests
   * @param {*} board     Represents the board to search for
   * @param {*} res       Represents the response
   *
   */
  static getThreads(board, res) {
    crud.getThreads(board).then((threads) => {
      let results = threads.sort((a, b) => b.bumped_on - a.bumped_on);
      res.json(results.length > 10 ? results.slice(0, 10) : results);
    });
  }

  /**
   * Saves a new thread in the DB during POST
   * @param {*} board     Represents the board with the thread
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
        return;
      }

      crud.findThread(data.thread_id).then((thread) => {
        if (bcrypt.compareSync(data.delete_password, thread.delete_password)) {
          crud.deleteThread(thread._id).then(() => res.send("success"));
        } else {
          res.send("incorrect password");
        }
      });
    });
  }
};
