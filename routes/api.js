"use strict";

/**
 * Module that handles most of the routing
 * @module ./routes/api
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = function (app) {
  app.route("/api/threads/:board");

  app.route("/api/replies/:board");
};
