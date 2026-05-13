const { Telegraf } = require('telegraf');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const config = require('./config');

const bot = new Telegraf(config.botToken);
const DB_PATH = './database.json';

// Fungsi Database (Simpan Email)
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

// Menu dengan Font Kecil Tebal
const getMenu = (ctx) => {
    return `
╭──────( **CHINA** )──────╮
│✘ᴜsᴇʀ: **@${ctx.from.username || 'User'}**
│✘ᴜsᴇʀɪᴅ: \`${ctx.from.id}\`
│✘sᴛᴀᴛᴜs: **ᴋᴀᴘᴛᴇɴ**
╠────────────────╣
│□ \`/addemail\` **[ᴛᴀᴍʙᴀʜ ᴛᴀʀɢᴇᴛ]**
│□ \`/listemail\` **[ᴄᴇᴋ ᴅᴀᴛᴀʙᴀsᴇ]**
│□ \`/spammsg\` **[ᴇᴋsᴇᴋᴜsɪ ᴀʟʟ]**
│□ \`/clearemail\` **[ʜᴀᴘᴜs sᴇᴍᴜᴀ]**
╰──────( **CHINA** )──────╯
© **ᴛɪᴍ sᴜᴋᴀ sᴜᴋᴀ** 〽️`;
};

bot.start((ctx) => {
    ctx.reply(getMenu(ctx), { parse_mode: 'Markdown' });
});

bot.command('addemail', async (ctx) => {
    const email = ctx.message.text.split(' ')[1];
    if (!email || !email.includes('@')) return ctx.reply('⚠️ **ꜰᴏʀᴍᴀᴛ sᴀʟᴀʜ!**\nɢᴜɴᴀᴋᴀɴ: `/addemail email@target.com`', { parse_mode: 'Markdown' });
    
    let db = await loadDB();
    if (db.includes(email)) return ctx.reply('❌ **ᴇᴍᴀɪʟ sᴜᴅᴀʜ ᴀᴅᴀ!**', { parse_mode: 'Markdown' });
    
    db.push(email);
    await saveDB(db);
    ctx.reply(`✅ **ᴛᴇʀsɪᴍᴘᴀɴ:** \`${email}\``, { parse_mode: 'Markdown' });
});

bot.command('listemail', async (ctx) => {
    let db = await loadDB();
    if (db.length === 0) return ctx.reply('📂 **ᴅᴀᴛᴀʙᴀsᴇ ᴋᴏsᴏɴɢ!**', { parse_mode: 'Markdown' });
    
    let list = db.map((e, i) => `${i + 1}. \`${e}\``).join('\n');
    ctx.reply(`📊 **ᴅᴀᴛᴀʙᴀsᴇ ᴛᴀʀɢᴇᴛ (${db.length}):**\n\n${list}`, { parse_mode: 'Markdown' });
});

bot.command('clearemail', async (ctx) => {
    await saveDB([]);
    ctx.reply('🗑️ **ᴅᴀᴛᴀʙᴀsᴇ ʙᴇʀʜᴀsɪʟ ᴅɪᴋᴏsᴏɴɢᴋᴀɴ!**', { parse_mode: 'Markdown' });
});

bot.command('spammsg', async (ctx) => {
    let db = await loadDB();
    if (db.length === 0) return ctx.reply('❌ **ᴅʙ ᴋᴏsᴏɴɢ! ᴛᴀᴍʙᴀʜ ᴇᴍᴀɪʟ ᴅᴜʟᴜ.**', { parse_mode: 'Markdown' });
    
    ctx.reply(`🚀 **ᴍᴇɴɢᴇᴋsᴇᴋᴜsɪ ${db.length} ᴛᴀʀɢᴇᴛ...**`, { parse_mode: 'Markdown' });
    
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
    ctx.reply(`✅ **ᴅᴜᴀʀʀʀ!**\n🚀 **sᴜᴋsᴇs:** ${success}\n❌ **ɢᴀɢᴀʟ:** ${db.length - success}`, { parse_mode: 'Markdown' });
});

bot.launch().then(() => console.log('BOT RUNNING - DB READY'));
