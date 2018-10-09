const httpService = require('../HttpService');

const SEARCHURL = 'https://play.google.com/store/search?q=&c=music&hl=ru';
const GOOGLEMUSICPREFIX = 'https://play.google.com';

const getAlbumsUrl = (doc) => {
    let urlItems = doc.getElementsByClassName('title-link id-track-click');
    let urls = [];
    [].forEach.call(urlItems, urlItem => {
        urls.push(urlItem.getAttribute('href'));
    });

    for (let url of urls) {
        if (~url.indexOf('cluster:2')) {
            return GOOGLEMUSICPREFIX + url;
        }
    }
    return '';
};

const getAlbums = (doc) => {
    let albumsList = doc.getElementsByClassName('id-card-list card-list two-cards')[0]
        || doc.getElementsByClassName('id-card-list card-list one-card')[0];
    let albumsItems = albumsList
        .getElementsByClassName('card-content id-track-click id-track-impression');
    let albums = [];

    [].forEach.call(albumsItems, el => {
        let album = {};
        album.url = GOOGLEMUSICPREFIX
            + el.getElementsByClassName('card-click-target')[0].getAttribute('href')
        album.imageUrl = el.getElementsByClassName('cover-image')[0]
            .getAttribute('src').replace('w170', 'w480');
        album.title = el.getElementsByClassName('title')[0].textContent.trim();
        album.artist = el.getElementsByClassName('subtitle')[0].textContent;
        albums.push(album);
    });
    return albums;
};

export const find = async (searchString) => {
    let index = SEARCHURL.indexOf("q=") + 2;
    let url = SEARCHURL.slice(0, index) + searchString + SEARCHURL.slice(index);
    let doc = await httpService.makeRequest('get', encodeURI(url));
    return new Promise(async resolve => {
        if (doc !== null) {
            let albumsUrl = getAlbumsUrl(doc); //dont need encodeURI
            if (albumsUrl !== '') {
                let albumsDoc = await httpService.makeRequest('get', albumsUrl);
                if (albumsDoc !== null)
                    return resolve(getAlbums(albumsDoc));
                else
                    return resolve([]);
            }
        }
        return resolve([]);
    })
};