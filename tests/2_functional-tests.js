const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /* My Tests */
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
          done();
        });
    });
  });
});
