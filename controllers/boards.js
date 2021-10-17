const crud = require("../crud");

/**
 * Controller for getting and creating new boards
 * @module ./controllers/board
 *
 */
module.exports = class BoardController {
  /**
   * Gets a board in the DB
   * @param {String} name     Represents the name of the board
   * @returns                 Returns a board or null
   */
  static findBoard(name) {
    let board = null;
    crud.getBoard(name).then((boardObj) => (board = boardObj));
    return board;
  }

  /**
   * Checks if the board actual exists in the DB
   * @param {String} name     Represents the name of the board
   * @returns                 Returns a boolean value
   */
  static boardExists(name) {
    return this.findBoard(name) != null;
  }

  /**
   * Saves a board in the DB
   * @param {String} name     Represents the name of the board
   * @returns                 Returns the board that was created
   */
  static saveBoard(name) {
    let board = null;
    crud
      .addBoard({ name: name, threads: [] })
      .then((boardObj) => (board = boardObj))
      .catch((e) => (board = e.errors.name.message));
    return board;
  }
};
