const httpService = require('../HttpService');

const SEARCHURL = 'http://myzcloud.me/search?searchText=';
const PREFIX = 'http://myzcloud.me';

const getTrackInfo = (doc) => {
    let playlist = doc.getElementsByClassName('playlist playlist--hover')[0];
    if (playlist !== undefined) {
        let track = playlist.getElementsByClassName('playlist__item')[0];
        if (track !== undefined) {
            let id = track.getAttribute('id').match(/\d+/g);
            let url = track.getElementsByClassName('dl-song')[0].getAttribute('href');
            return {
                url: PREFIX + url,
                id: id
            };
        }
    }
    return null;
};

const getTrack = (doc, {id}) => {
    let link = doc.getElementById(`dl_${id}`);
    if (link !== undefined) {
        let url = link.getAttribute('href');
        return PREFIX + url;
    }
};

export const find = async (searchString) => {
    let url = SEARCHURL + searchString;
    let doc = await httpService.makeRequest('get', encodeURI(url));
    return new Promise(async resolve => {
        if (doc != null) {
            let trackInfo = getTrackInfo(doc);
            if (trackInfo != null) {
                let trackDoc = await httpService.makeRequest('get', encodeURI(trackInfo.url));
                if (trackDoc != null)
                    return resolve(getTrack(trackDoc, trackInfo));
            }
        }
        return resolve('');
    });
};