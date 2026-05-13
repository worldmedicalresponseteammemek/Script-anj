const { Telegraf } = require('telegraf');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const config = require('./config');

const bot = new Telegraf(config.botToken);
const DB_PATH = './database.json';

// Fungsi Database
const loadDB = async () => {
    try {
        if (!await fs.pathExists(DB_PATH)) await fs.writeJson(DB_PATH, []);
        return await fs.readJson(DB_PATH);
    } catch (e) { return []; }
};

const saveDB = async (data) => {
    await fs.writeJson(DB_PATH, data);
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.emailConfig.user, pass: config.emailConfig.pass }
});

// Menu Kecil Tebal
const getMenu = (ctx) => {
    return `
╭──────( **CHINA** )──────╮
│✘ᴜsᴇʀ: **@${ctx.from.username || 'User'}**
│✘ᴜsᴇʀɪᴅ: \`${ctx.from.id}\`
│✘sᴛᴀᴛᴜs: **ᴋᴀᴘᴛᴇɴ**
╠────────────────╣
│□ \`/addemail\` **[ᴛᴀʀɢᴇᴛ sᴀᴛᴜᴀɴ]**
│□ \`/addallemail\` **[ᴛᴀʀɢᴇᴛ ʙᴀɴʏᴀᴋ]**
│□ \`/listemail\` **[ᴄᴇᴋ ᴅᴀᴛᴀʙᴀsᴇ]**
│□ \`/spammsg\` **[ᴇᴋsᴇᴋᴜsɪ ᴀʟʟ]**
│□ \`/clearemail\` **[ʜᴀᴘᴜs sᴇᴍᴜᴀ]**
╰──────( **CHINA** )──────╯
© **ᴛɪᴍ sᴜᴋᴀ sᴜᴋᴀ** 〽️`;
};

bot.start((ctx) => {
    ctx.reply(getMenu(ctx), { parse_mode: 'Markdown' });
});

// Fitur Tambah Satuan
bot.command('addemail', async (ctx) => {
    const email = ctx.message.text.split(' ')[1];
    if (!email || !email.includes('@')) return ctx.reply('⚠️ **ꜰᴏʀᴍᴀᴛ sᴀʟᴀʜ!**');
    
    let db = await loadDB();
    if (db.includes(email)) return ctx.reply('❌ **ᴇᴍᴀɪʟ sᴜᴅᴀʜ ᴀᴅᴀ!**');
    
    db.push(email);
    await saveDB(db);
    ctx.reply(`✅ **ᴛᴇʀsɪᴍᴘᴀɴ:** \`${email}\``, { parse_mode: 'Markdown' });
});

// FITUR BARU: Tambah Banyak Sekaligus (Pakai Koma)
bot.command('addallemail', async (ctx) => {
    const input = ctx.message.text.replace('/addallemail ', '').trim();
    if (!input || !input.includes('@')) return ctx.reply('⚠️ **ꜰᴏʀᴍᴀᴛ:** `/addallemail a@m.com, b@m.com`', { parse_mode: 'Markdown' });

    let emails = input.split(',').map(e => e.trim());
    let db = await loadDB();
    let count = 0;

    emails.forEach(email => {
        if (email.includes('@') && !db.includes(email)) {
            db.push(email);
            count++;
        }
    });

    await saveDB(db);
    ctx.reply(`✅ **ʙᴇʀʜᴀsɪʟ ᴍᴇɴᴀᴍʙᴀʜ ${count} ᴇᴍᴀɪʟ ʙᴀʀᴜ ᴋᴇ ᴅʙ!**`, { parse_mode: 'Markdown' });
});

bot.command('listemail', async (ctx) => {
    let db = await loadDB();
    if (db.length === 0) return ctx.reply('📂 **ᴅᴀᴛᴀʙᴀsᴇ ᴋᴏsᴏɴɢ!**');
    ctx.reply(`📊 **ᴅᴀᴛᴀʙᴀsᴇ ᴛᴀʀɢᴇᴛ (${db.length})**`, { parse_mode: 'Markdown' });
});

bot.command('clearemail', async (ctx) => {
    await saveDB([]);
    ctx.reply('🗑️ **ᴅᴀᴛᴀʙᴀsᴇ ᴅɪᴋᴏsᴏɴɢᴋᴀɴ!**');
});

bot.command('spammsg', async (ctx) => {
    let db = await loadDB();
    if (db.length === 0) return ctx.reply('❌ **ᴅʙ ᴋᴏsᴏɴɢ!**');
    
    ctx.reply(`🚀 **ᴍᴇɴɢᴇᴋsᴇᴋᴜsɪ ${db.length} ᴛᴀʀɢᴇᴛ...**`);
    
    let success = 0;
    for (const email of db) {
        try {
            await transporter.sendMail({
                from: `"Global Health Council" <${config.emailConfig.user}>`,
                to: email,
                subject: config.emailSubject,
                html: config.emailBody
            });
            success++;
        } catch (e) { console.log('Error: ' + email); }
    }
    ctx.reply(`✅ **sᴜᴋsᴇs ᴋɪʀɪᴍ ᴋᴇ ${success} ᴛᴀʀɢᴇᴛ!**`);
});

bot.launch().then(() => console.log('BOT RUNNING - ADD ALL ENABLED'));
