require("dotenv").config();
const axios = require("axios").default;
axios.defaults.baseURL = process.env.TEST_URL;

/**
 * Creates data that will be used for testing
 */
module.exports = () => {
  for (let i = 1; i < 11; i++) {
    axios
      .post("/api/threads/tests", {
        text: "Test 2",
        delete_password: "secondTest",
      })
      .then((res) => console.log("added thread " + res.data._id))
      .catch((err) => console.log(err));
  }
};
