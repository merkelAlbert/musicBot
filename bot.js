const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const albumFinder = require('./Parsers/GMParser/AlbumFinder');
const albumParser = require('./Parsers/GMParser/AlbumParser');
const trackFinder = require('./Parsers/TracksParser/TrackFinder');
const fileServer = require('./FileServer/FileServer');

require('dotenv').config();

const bot = new Telegraf(process.env.TOKEN);

const getAlbumInfo = (albums, index) => {
    return {
        url: albums[index].url,
        artist: albums[index].artist,
        title: albums[index].title,
        image: albums[index].imageUrl,
    };
};

const handleAlbum = async (ctx, albums, index) => {
    const album = getAlbumInfo(albums, index);
    ctx.reply(`${album.image}\n${album.artist}\n${album.title}`, Markup.inlineKeyboard([
        Markup.callbackButton('⮇ Скачать', await 'download'),
        Markup.callbackButton('➡️ Следующий', await 'next')
    ]).extra());

    bot.action('download', async ctx => {
        await ctx.reply('Подождите, песни скоро загрузятся...');
        const data = JSON.parse(await fileServer.get(ctx.from.id));
        let tracks = await albumParser.getTracks(data.albums[data.index].url);
        const urlPromises = [];
        for (let track of tracks) {
            urlPromises.push(trackFinder.find(`${data.albums[data.index].artist} ${track}`));
        }
        const urls = await Promise.all(urlPromises);
        const nothing = urls.every(url => {
            return url === ''
        });
        if (!nothing) {
            const replyPromises = [];
            for (let url of urls) {
                if (url !== '') {
                    replyPromises.push(ctx.replyWithAudio(url).catch(reason => console.log(reason)));
                }
            }
            await Promise.all(replyPromises);
        }
        else {
            await ctx.reply('Песни не найдены');
        }
        await ctx.reply('Можно продолжать');
        await fileServer.remove(ctx.from.id);
    });

    bot.action('next', async ctx => {
        const data = JSON.parse(await fileServer.get(ctx.from.id));
        ctx.deleteMessage();
        if (data.index < data.albums.length - 1) {
            await fileServer.update(ctx.from.id, 'index', data.index + 1);
            data.index++;
        }
        else {
            await fileServer.update(ctx.from.id, 'index', 0);
            data.index = 0;
        }
        handleAlbum(ctx, data.albums, data.index + 1);
    });
};


const loadAlbums = async (ctx) => {
    await ctx.reply('подождите...');

    //находим альбомы
    const searchString = ctx.message.text;
    const albums = await albumFinder.find(searchString);
    if (albums.length !== 0) {
        const obj = {
            albums: albums,
            index: 0
        };
        await fileServer.save(ctx.from.id, obj);

        //выбираем нужный альбом
        handleAlbum(ctx, albums, 0);
    }
    else
        await ctx.reply('Ничего не найдено');
};
bot.start(async (ctx) => {
    await fileServer.remove(ctx.from.id);
    await ctx.reply(`Привет ${ctx.from.first_name}, введите имя артиста или альбома`);
});

bot.on('text', async ctx => {
    await loadAlbums(ctx);
});

bot.startPolling();