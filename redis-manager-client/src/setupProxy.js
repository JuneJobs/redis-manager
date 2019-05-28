
const proxy = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(proxy("/serverapi", {
        target: "http://localhost:1234/"
    }));
    // app.use(proxy("/keys", {
    //     target: "http://localhost:1234/keys"
    // }));
    // app.use(proxy("/MonitorList", {
    //     target: "http://localhost:1234/MonitorList"
    // }));
};