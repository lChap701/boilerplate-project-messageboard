require("dotenv").config();
const crud = require("../crud");
const bcrypt = require("bcrypt");
//const ObjectId = require("mongodb").ObjectId;
const BoardController = require("../controllers/boards");

/**
 * Module that handles all HTTP requests for threads
 * @module ./controllers/threads
 *
 */
module.exports = class ThreadController {
  /**
   * Gets all threads for GET requests
   * @param {String} board    Represents the board to search for
   * @returns                 Returns all threads that were found
   */
  static getThreads(board) {
    let results = [];

    if (!BoardController.boardExists(board)) return results;

    crud
      .getThreads(BoardController.findBoard(board)._id)
      .then(
        (threads) =>
          (results = threads.sort((a, b) => b.bumped_on - a.bumped_on))
      );

    return results.length > 10 ? results.slice(0, 10) : results;
  }

  /**
   * Saves a new thread in the DB during POST
   * @param {String} board      Represents the name of the board
   * @param {*} data            Represents the thread to save
   * @returns                   Returns the new thread or an error message
   */
  static postThread(board, data) {
    let thread = {};

    if (!BoardController.boardExists(board)) {
      let result = BoardController.saveBoard(board);
      if (typeof result != "object") return result;
    }

    // Encrypts the 'delete_password' field
    data.delete_password = bcrypt.hashSync(
      data.delete_password,
      process.env.SALT_ROUNDS
    );

    // Gets the board ID
    let boardObj = BoardController.findBoard(board);
    data.board = boardObj._id;

    crud
      .addThread(data)
      .then((threadObj) => {
        thread = threadObj;
        boardObj.threads.push(threadObj);
        boardObj.save();
      })
      .catch((e) => {
        console.log(JSON.stringify(e.errors));
        Object.keys(e.errors).forEach((field) => {
          if (e.errors[field]) thread = e.errors[field].message;
        });
      });

    return thread;
  }

  /**
   * Updates a thread during PUT requests
   * @param {String} board    Represents the board
   * @param {String} id       Represents the ID of the thread
   * @returns                 Returns a message
   */
  static putThread(board, id) {
    let result = "thread was not found in board " + board;

    if (!BoardController.boardExists(board)) return result;

    crud.getThreads(BoardController.findBoard(board)._id).then((threads) => {
      if (threads.filter((thread) => thread._id == id).length > 0) {
        crud.reportThread(id).then(() => (result = "success"));
      }
    });

    return result;
  }

  /**
   * Deletes a thread during DELETE requests
   * @param {String} board      Represents the board
   * @param {*} data            Represents the data to use for deletion
   * @returns                   Returns a message
   */
  static deleteThread(board, data) {
    let result = "thread was not found in board " + board;

    if (!BoardController.boardExists(board)) return result;

    crud.getThreads(BoardController.findBoard(board)._id).then((threads) => {
      if (threads.filter((thread) => thread._id == id).length == 0) return;
      crud.findThread(data.thread_id).then((thread) => {
        if (bcrypt.compareSync(data.delete_password, thread.delete_password)) {
          crud.deleteThread(thread._id).then(() => (result = "success"));
        } else {
          result = "incorrect password";
        }
      });
    });

    return result;
  }
};
