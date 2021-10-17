const crud = require("../crud");
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
   * @returns                 Returns all threads that were found or an error message
   */
  static getThreads(board) {
    let results = [];

    if (!BoardController.boardExists(board)) {
      let result = BoardController.saveBoard(board);
      if (typeof result != "object") return result;
    }

    crud
      .getThreads(BoardController.findBoard(board).name)
      .then(
        (threads) =>
          (results = threads.sort((a, b) => b.bumped_on - a.bumped_on))
      );

    return results.length > 10 ? results.slice(0, 10) : results;
  }
};
