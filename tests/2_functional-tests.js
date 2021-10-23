const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
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
          assert.isArray(
            JSON.parse(res.text),
            "response should return an array"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "_id",
            "response should contain a property of '_id'"
          );
          assert.propertyVal(
            JSON.parse(res.text)[0],
            "text",
            "Test 1",
            "response should contain a property of 'text' with a value of 'Test 1'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "created_on",
            "response should contain a property of 'created_on'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "bumped_on",
            "response should contain a property of 'bumped_on'"
          );
          assert.isTrue(
            JSON.parse(res.text)[0].created_on ==
              JSON.parse(res.text)[0].bumped_on,
            "'created_on' should be the same as 'bumped_on'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "reported",
            "response should contain a property of 'reported'"
          );
          assert.isBoolean(
            JSON.parse(res.text)[0].reported,
            "'reported' should be boolean"
          );
          assert.isFalse(
            JSON.parse(res.text)[0].reported,
            "'reported' should be set to 'false'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "delete_password",
            "response should contain a property of 'delete_password'"
          );
          assert.property(
            JSON.parse(res.text)[0],
            "replies",
            "response should contain a property of 'replies'"
          );
          assert.isArray(
            JSON.parse(res.text)[0].replies,
            "'replies' should be an array"
          );
          id = JSON.parse(res.text)[0]._id;
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
            "bumped_on",
            "response should contain objects with a property of 'bumped_on'"
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
            "delete_password",
            "response should contain objects without a property of 'delete_password'"
          );
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

    test("4)  Invalid DELETE Test", (done) => {
      chai
        .request(server)
        .delete(PATH + "tests")
        .send({ thread_id: id, delete_password: "fourthTest" })
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.equal(
            res.text,
            "incorrect password",
            "response should comeback as 'incorrect password'"
          );
          done();
        });
    });

    test("5)  Valid DELETE Test", (done) => {
      chai
        .request(server)
        .delete(PATH + "tests")
        .send({ thread_id: id, delete_password: "firstTest" })
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

  suite("Testing /api/replies/", () => {
    const PATH = "/api/replies/";
    let threadId = "";
    let replyId = "";

    test("1)  POST Test", (done) => {
      crud.getBoard("tests").then((board) => {
        crud
          .addThread({
            text: "testing thread",
            delete_password: "12345",
            board: board._id,
          })
          .then((thread) => {
            board.threads.push(thread);
            board.save();
            threadId = thread._id;

            const data = {
              thread_id: threadId,
              text: "Test 11",
              delete_password: "eleventhTest",
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
                  "replies",
                  "response should contain a property of 'replies'"
                );
                assert.isArray(
                  JSON.parse(res.text).replies,
                  "'replies' should be an array"
                );
                assert.property(
                  JSON.parse(res.text).replies[0],
                  "_id",
                  "'replies' should contain a property of '_id'"
                );
                assert.propertyVal(
                  JSON.parse(res.text).replies[0],
                  "text",
                  "Test 11",
                  "'replies' should contain a property of 'text' with a value of 'Test 11'"
                );
                assert.property(
                  JSON.parse(res.text).replies[0],
                  "reported",
                  "response should contain a property of 'reported'"
                );
                assert.isBoolean(
                  JSON.parse(res.text).replies[0].reported,
                  "'reported' should be boolean"
                );
                assert.isFalse(
                  JSON.parse(res.text).replies[0].reported,
                  "'reported' should be set to 'false'"
                );
                assert.property(
                  JSON.parse(res.text).replies[0],
                  "delete_password",
                  "response should contain a property of 'delete_password'"
                );
                assert.property(
                  JSON.parse(res.text).replies[0],
                  "created_on",
                  "'replies' should contain a property of 'created_on'"
                );
                assert.isTrue(
                  JSON.parse(res.text).replies[0].created_on ==
                    JSON.parse(res.text).bumped_on,
                  "the 'created_on' of reply should be the same as the 'bumped_on' of thread"
                );
                replyId = JSON.parse(res.text).replies[0]._id;
                done();
              });
          });
      });
    });

    test("2)  GET Test", (done) => {
      chai
        .request(server)
        .get(PATH + "tests?thread_id=" + threadId.toString())
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.property(
            JSON.parse(res.text),
            "replies",
            "response should contain a property of 'replies'"
          );
          assert.isArray(
            JSON.parse(res.text).replies,
            "'replies' should be an array"
          );
          assert.isAbove(
            JSON.parse(res.text).replies.length,
            0,
            "the length of 'replies' should be greater than '0'"
          );
          assert.property(
            JSON.parse(res.text).replies[0],
            "_id",
            "'replies' should contain objects with a property of '_id'"
          );
          assert.property(
            JSON.parse(res.text).replies[0],
            "text",
            "'replies' should contain objects with a property of 'text'"
          );
          assert.property(
            JSON.parse(res.text).replies[0],
            "created_on",
            "'replies' should contain objects with a property of 'created_on'"
          );
          assert.notProperty(
            JSON.parse(res.text).replies[0],
            "reported",
            "response should contain objects without a property of 'reported'"
          );
          assert.notProperty(
            JSON.parse(res.text).replies[0],
            "delete_password",
            "response should contain objects without a property of 'delete_password'"
          );
          done();
        });
    });

    test("3)  PUT Test", (done) => {
      chai
        .request(server)
        .put(PATH + "tests")
        .send({ thread_id: threadId, reply_id: replyId })
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

    test("4)  Invalid DELETE Test", (done) => {
      const data = {
        thread_id: threadId,
        reply_id: replyId,
        delete_password: "12345",
      };

      chai
        .request(server)
        .delete(PATH + "tests")
        .send(data)
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.equal(
            res.text,
            "incorrect password",
            "response should comeback as 'incorrect password'"
          );
          done();
        });
    });

    test("5)  Valid DELETE Test", (done) => {
      const data = {
        thread_id: threadId,
        reply_id: replyId,
        delete_password: "eleventhTest",
      };

      chai
        .request(server)
        .delete(PATH + "tests")
        .send(data)
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
