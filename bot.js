const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const albumFinder = require('./Parsers/GMParser/AlbumFinder');
const albumParser = require('./Parsers/GMParser/AlbumParser');
const trackFinder = require('./Parsers/TracksParser/TrackFinder');
const fileServer = require('./FileServer/FileServer');

require('dotenv').config();

const bot = new Telegraf(process.env.TOKEN);

const getAlbum = (albums, index) => {
    return {
        url: albums[index].url,
        artist: albums[index].artist,
        title: albums[index].title,
        image: albums[index].imageUrl,
    };
};

const handleAlbum = async (ctx, albums, index) => {
    const album = getAlbum(albums, index);
    ctx.reply(`${album.image}\n${album.artist}\n${album.title}`, Markup.inlineKeyboard([
        Markup.callbackButton('⮇ Скачать', 'download'),
        Markup.callbackButton('➡️ Следующий', await 'next')
    ]).extra());

    bot.action('download', async ctx => {
        let tracks = await albumParser.getTracks(album.url);
        tracks.forEach(async track => {
            let url = await trackFinder.find(`${album.artist} ${track}`);
            if (url !== '') {
                ctx.replyWithAudio(url);
            }
        })
    });

    bot.action('next', async ctx => {
        const data = JSON.parse(await fileServer.get(ctx.from.id));
        ctx.deleteMessage();
        if (data.index < data.albums.length - 1) {
            fileServer.update(ctx.from.id, 'index', data.index + 1);
            data.index++;
        }
        else {
            fileServer.update(ctx.from.id, 'index', 0);
            data.index = 0;
        }
        handleAlbum(ctx, data.albums, data.index + 1);
    });
};


const loadAlbums = async (ctx) => {
    ctx.reply('подождите...');

    //находим альбомы
    const searchString = ctx.message.text;
    const albums = await albumFinder.find(searchString);
    if (albums.length !== 0) {
        const obj = {
            albums: albums,
            index: 0
        };
        fileServer.save(ctx.from.id, obj);

        //выбираем нужный альбом
        handleAlbum(ctx, albums, 0);
    }
    else
        ctx.reply('Ничего не найдено');
};
bot.start((ctx) => {
    fileServer.remove(ctx.from.id);
    ctx.reply(`Привет ${ctx.from.first_name}, введите имя артиста или альбома`);
});

bot.on('text', ctx => {
    loadAlbums(ctx);
});

bot.startPolling();