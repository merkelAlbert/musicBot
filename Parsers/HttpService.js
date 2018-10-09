const needle = require('needle');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

export const makeRequest = (method, url) => {
    let doc = {};
    return new Promise(resolve => {
        needle.request(method, url, null, (err, response) => {
            if (!err && response.statusCode === 200) {
                doc = new JSDOM(response.body).window.document;
                return resolve(doc);
            }
            return resolve(null);
        })
    });
};