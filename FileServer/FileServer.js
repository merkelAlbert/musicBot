const fs = require('fs');
const http = require('http');
const request = require('request');
const PATH = './FileServer/files/';

export const save = (fileName, obj) => {
    fs.writeFile(PATH + fileName + '.json', JSON.stringify(obj), (err => {
        if (err)
            console.log(err);
    }));
};

export const get = (fileName) => {
    return new Promise((resolve, reject) => fs.readFile(PATH + fileName + '.json', (err, data) => {
        if (err) {
            console.log(err);
            reject(err);
        }
        resolve(data);
    }));
};

export const update = async (fileName, field, value) => {
    const obj = JSON.parse(await get(fileName));
    obj[field] = value;
    save(fileName, obj);
};

export const remove = (fileName) => {
    const file = PATH + fileName + '.json';
    fs.access(file, fs.constants.F_OK, err => {
        if (!err)
            fs.unlink(file, (err => {
                if (err)
                    console.log(err);
            }));
    });
};

/*

export const saveTrack = async (url, userId, fileName) => {
    const directory = PATH + userId + '/';
    const filePath = directory + fileName + '.mp3';

    const options = {
        method: 'GET',
        url: url,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*!/!*;q=0.8',
            'Connection': 'keep-alive,',
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:62.0) Gecko/20100101 Firefox/62.0'
        }
    };

    if (!fs.existsSync(directory))
        fs.mkdir(directory, err => {
            console.log(err);
        });
    return new Promise((resolve, reject) => {
        request(url, options, (err, res) => {
            if (err) {
                reject();
            }

            fs.writeFile(filePath, res.body, err => console.log(err));
            resolve();
        });
    });
};
*/
