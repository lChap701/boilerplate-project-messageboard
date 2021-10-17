"use strict";
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
    .get((req, res) => res.json(ThreadController.getThreads(req.params.board)))

    .post((req, res) => {
      console.log(req.body);
      let result = ThreadController.postThread(req.params.board, {
        text: req.body.text,
        delete_password: req.body.delete_password,
      });

      if (typeof result == "object") {
        res.json(result);
      } else {
        res.send(result);
      }
    })

    .put((req, res) => {
      let id = Boolean(req.body.report_id)
        ? req.body.report_id
        : req.body.thread_id;

      res.send(ThreadController.putThread(req.params.board, id));
    })

    .delete((req, res) =>
      res.send(
        ThreadController.deleteThread(req.params.board, {
          thread_id: req.body.thread_id,
          delete_password: req.body.delete_password,
        })
      )
    );

  app.route("/api/replies/:board");
};
