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
    crud.getBoard("tests").then((board) => {
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
    let id = "";

    test("1)  POST Test", (done) => {
      const data = {
        text: "Test 1",
        delete_password: "firstTest",
      };

      chai
        .request(server)
        .post(PATH + "tests")
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
          id = JSON.parse(res.text)._id;
          done();
        });
    });

    test("2)  GET Test", (done) => {
      chai
        .request(server)
        .get(PATH + "tests")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(JSON.parse(res.text), "response should be an array");
          assert.isAtMost(
            JSON.parse(res.text).length,
            10,
            "response's length should not exceed 10"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "_id",
            "response should contain objects with a property of '_id'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "text",
            "response should contain objects with a property of 'text'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "created_on",
            "response should contain objects with a property of 'created_on'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "replycount",
            "response should contain objects with a property of 'replycount'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "replies",
            "response should contain objects with a property of 'replies'"
          );
          assert.isAtMost(
            JSON.parse(res.text)[0].replies.length,
            3,
            "length of 'replies' should not exceed 3"
          );
          assert.notProperty(
            JSON.parse(res.text)[0],
            "reported",
            "response should contain objects without a property of 'reported'"
          );
          assert.notProperty(
            JSON.parse(res.text)[0],
            "delete_text",
            "response should contain objects without a property of 'delete_text'"
          );
          /*assert.notProperty(
            JSON.parse(res.text)[0].replies[0],
            "reported",
            "'replies' should contain objects without a property of 'reported'"
          );
          assert.notProperty(
            JSON.parse(res.text)[0].replies[0],
            "delete_text",
            "'replies' should contain objects without a property of 'delete_text'"
          );*/
          done();
        });
    });

    test("3)  PUT Test", (done) => {
      chai
        .request(server)
        .put(PATH + "tests")
        .send({ report_id: id })
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.equal(
            res.text,
            "success",
            "response should comeback as 'success'"
          );
          done();
        });
    });
  });
});
