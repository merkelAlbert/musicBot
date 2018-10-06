const fs = require('fs');

const PATH = './FileServer/files/';

export const save = (fileName, obj) => {
    fs.writeFile(PATH + fileName + '.json', JSON.stringify(obj), (err => {
        if (err)
            console.log(err);
    }));
};

export const get = (fileName) => {
    return new Promise(resolve => fs.readFile(PATH + fileName + '.json', (err, data) => {
        if (err)
            console.log(err);
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
