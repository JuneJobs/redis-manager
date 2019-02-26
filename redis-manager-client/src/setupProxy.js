
const proxy = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(proxy("/serverapi", {
        target: "http://somnium.me:8080/"
    }));
};