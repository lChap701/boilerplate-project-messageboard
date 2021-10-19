"use strict";
require("dotenv").config();
const bcrypt = require("bcrypt");
const crud = require("../crud");
const ThreadController = require("../controllers/threads");

/**
 * Module that handles most of the routing
 * @module ./routes/api
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .get((req, res) => {
      crud.getBoard(req.params.board).then((board) => {
        if (!board) return;
        ThreadController.getThreads(board, res);
      });
    })

    .post((req, res) => {
      console.log(req.body);
      crud.getBoard(req.params.board).then((board) => {
        if (!board) {
          crud
            .addBoard({ name: req.params.board, threads: [] })
            .then((boardObj) => {
              ThreadController.postThread(
                boardObj,
                {
                  text: req.body.text,
                  delete_password: bcrypt.hashSync(
                    req.body.delete_password,
                    parseInt(process.env.SALT_ROUNDS)
                  ),
                  board: boardObj._id,
                },
                res
              );
            })
            .catch((e) => res.send(e.errors.name.message));
          return;
        }

        ThreadController.postThread(
          board,
          {
            text: req.body.text,
            delete_password: bcrypt.hashSync(
              req.body.delete_password,
              parseInt(process.env.SALT_ROUNDS)
            ),
            board: board._id,
          },
          res
        );
      });
    })

    .put((req, res) => {
      let id = Boolean(req.body.report_id)
        ? req.body.report_id
        : req.body.thread_id;

      crud.getBoard(req.params.board).then((board) => {
        if (!board) {
          res.send("thread was not found in board " + req.params.board);
        } else {
          ThreadController.putThread(board, id, res);
        }
      });
    })

    .delete((req, res) => {
      crud.getBoard(req.params.board).then((board) => {
        if (!board) {
          res.send("thread was not found in board " + req.params.board);
          return;
        }

        ThreadController.deleteThread(
          board,
          {
            thread_id: req.body.thread_id,
            delete_password: req.body.delete_password,
          },
          res
        );
      });
    });

  app.route("/api/replies/:board");
};
