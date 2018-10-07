const httpService = require('../HttpService');

const SEARCHURL = 'http://myzcloud.me/search?searchText=';
const PREFIX = 'http://myzcloud.me';

const getTrackInfo = (doc) => {
    let playlist = doc.getElementsByClassName('playlist playlist--hover')[0];
    let track = playlist.getElementsByClassName('playlist__item')[0];
    let id = track.getAttribute('id').match(/\d+/g);
    let url = track.getElementsByClassName('dl-song')[0].getAttribute('href');
    return {
        url: PREFIX + url,
        id: id
    };
};

const getTrack = (doc, {id}) => {
    let url = doc.getElementById(`dl_${id}`).getAttribute('href');
    return PREFIX + url;
};

export const find = async (searchString) => {
    let url = SEARCHURL + searchString;
    let doc = await httpService.makeRequest('get', encodeURI(url));
    if (doc != null) {
        let trackInfo = getTrackInfo(doc);
        let trackDoc = await httpService.makeRequest('get', encodeURI(trackInfo.url));
        if (trackDoc != null)
            return getTrack(trackDoc, trackInfo);
    }
    return '';
};