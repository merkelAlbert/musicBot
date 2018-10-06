const httpService = require('../HttpService');

export const getTracks = async (url) => {
    let doc = await httpService.makeRequest('get', encodeURI(url));
    if (doc !== null) {
        let trackList = doc.getElementsByClassName('track-list')[0];
        let trackLines = trackList.getElementsByClassName('track-list-row');
        let tracks = [];
        [].forEach.call(trackLines,
            el => tracks.push(el.getElementsByClassName('title')[0].textContent));
        return tracks;
    }
    return [];
};