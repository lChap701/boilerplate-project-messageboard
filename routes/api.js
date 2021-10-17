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

    .post((req, res) => {})

    .put((req, res) => {})

    .delete((req, res) => {});

  app.route("/api/replies/:board");
};
