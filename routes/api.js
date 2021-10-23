"use strict";
require("dotenv").config();
const bcrypt = require("bcryptjs");
const crud = require("../crud");
const ThreadController = require("../controllers/threads");
const ReplyController = require("../controllers/replies");

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
      crud.getBoard(req.params.board).then((board) => {
        if (!board) {
          crud
            .addBoard({ name: req.params.board, threads: [] })
            .then((newBoard) => {
              ThreadController.postThread(
                newBoard,
                {
                  text: req.body.text,
                  delete_password: bcrypt.hashSync(
                    req.body.delete_password,
                    parseInt(process.env.SALT_ROUNDS)
                  ),
                  board: newBoard._id,
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

  app
    .route("/api/replies/:board")
    .get((req, res) => {
      crud.getBoard(req.params.board).then((board) => {
        if (!board || !req.query.thread_id) return;
        crud.getThread(req.query.thread_id).then((thread) => {
          if (!thread || String(thread.board) != String(board._id)) return;
          ReplyController.getReplies(thread, res);
        });
      });
    })

    .post((req, res) => {
      crud.getBoard(req.params.board).then((board) => {
        if (!board) {
          res.send("thread was not found in board " + req.params.board);
          return;
        }

        crud
          .getThread(req.body.thread_id)
          .populate({ path: "board" })
          .then((thread) => {
            if (!thread || String(thread.board._id) != String(board._id)) {
              res.send("thread was not found in board " + req.params.board);
              return;
            }

            ReplyController.postReply(
              thread,
              {
                text: req.body.text,
                delete_password: bcrypt.hashSync(
                  req.body.delete_password,
                  parseInt(process.env.SALT_ROUNDS)
                ),
                thread: thread._id,
              },
              res
            );
          });
      });
    })

    .put((req, res) => {
      crud.getBoard(req.params.board).then((board) => {
        if (!board) {
          res.send("thread was not found in board " + req.params.board);
          return;
        }

        crud.getThread(req.body.thread_id).then((thread) => {
          if (!thread || String(thread.board) != String(board._id)) {
            res.send("thread was not found in board " + req.params.board);
            return;
          }

          ReplyController.putReply(thread, req.body.reply_id, res);
        });
      });
    })

    .delete((req, res) => {
      crud.getBoard(req.params.board).then((board) => {
        if (!board) {
          res.send("thread was not found in board " + req.params.board);
          return;
        }

        crud.getThread(req.body.thread_id).then((thread) => {
          if (!thread || String(thread.board) != String(board._id)) {
            res.send("thread was not found in board " + req.params.board);
            return;
          }

          ReplyController.deleteReply(
            thread,
            {
              reply_id: req.body.reply_id,
              delete_password: req.body.delete_password,
            },
            res
          );
        });
      });
    });
};
