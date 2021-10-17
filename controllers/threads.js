const crud = require("../crud");

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

    crud.getBoard(board).then((boardObj) => {
      if (boardObj == null) return;
      crud
        .getThreads(boardObj.name)
        .then(
          (threads) =>
            (results = threads.sort((a, b) => b.bumped_on - a.bumped_on))
        );
    });

    return results.length > 10 ? results.slice(0, 10) : results;
  }
};
