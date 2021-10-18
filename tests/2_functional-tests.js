const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const bcrypt = require("bcrypt");
const server = require("../server");
const crud = require("../crud");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /* My Tests */
  this.afterAll(() => {
    crud.getBoard("test").then((board) => {
      board.threads.forEach((threadId) => {
        crud.getReplies(threadId).then((replies) => {
          replies.forEach((reply) => {
            crud
              .deleteReply(reply._id)
              .then(() => console.log("removed reply " + reply._id));
          });
        });

        crud
          .deleteThread(threadId)
          .then(() => console.log("removed thread " + threadId));
      });

      crud
        .deleteBoard(board._id)
        .then(() => console.log("removed board " + board._id));
    });
  });

  suite("Testing /api/threads/", () => {
    const PATH = "/api/threads/";

    test("1)  Valid POST Test", (done) => {
      const data = {
        text: "Test 1",
        delete_password: "firstTest",
      };

      chai
        .request(server)
        .post(PATH + "test")
        .send(data)
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isObject(
            JSON.parse(res.text),
            "response should return an object"
          );
          assert.property(
            JSON.parse(res.text),
            "_id",
            "response should contain a property of '_id'"
          );
          assert.propertyVal(
            JSON.parse(res.text),
            "text",
            "Test 1",
            "response should contain a property of 'text' with a value of 'Test 1'"
          );
          assert.property(
            JSON.parse(res.text),
            "created_on",
            "response should contain a property of 'created_on'"
          );
          assert.property(
            JSON.parse(res.text),
            "bumped_on",
            "response should contain a property of 'bumped_on'"
          );
          assert.isTrue(
            JSON.parse(res.text).created_on == JSON.parse(res.text).bumped_on,
            "'created_on' should be the same as 'bumped_on'"
          );
          assert.property(
            JSON.parse(res.text),
            "reported",
            "response should contain a property of 'reported'"
          );
          assert.isBoolean(
            JSON.parse(res.text).reported,
            "'reported' should be boolean"
          );
          assert.isFalse(
            JSON.parse(res.text).reported,
            "'reported' should be set to 'false'"
          );
          assert.property(
            JSON.parse(res.text),
            "delete_password",
            "response should contain a property of 'delete_password'"
          );
          assert.property(
            JSON.parse(res.text),
            "replies",
            "response should contain a property of 'replies'"
          );
          assert.isArray(
            JSON.parse(res.text).replies,
            "'replies' should be an array"
          );
          done();
        });
    });
  });
});
