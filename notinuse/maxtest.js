const maxApi = require('max-api');

maxApi.post("Hello from node!");

//data from max to node
maxApi.addHandler('input', (message) => {
    maxApi.post(`received from max ${message}`);
    let maxfilepath = message;
})