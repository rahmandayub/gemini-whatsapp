const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chatHistory = require('./chatHistory');
const gemini = require('./gemini');

require('dotenv').config();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.CHROME_BIN,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
        ],
    },
});

client.initialize();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code generated! Scan it with your phone!');
    console.log(qr);
});

client.on('loading_screen', (status) => {
    console.log('Loading screen: ' + status);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    async function generateTextFromText(name) {
        let response = await gemini.geminiReply(userId, userMessage, name);

        while (response === 'Fetch failed') {
            response = await gemini.geminiReply(userId, userMessage, name);
        }
        if (response !== 'Fetch failed') {
            if (msg.hasQuotedMsg) {
                msg.reply(response);
            } else {
                client.sendMessage(msg.from, response);
            }
        }
    }

    async function generateTextFromImage() {
        const media = await msg.downloadMedia();
        const mediaBuffer = media.data;
        const mimetype = media.mimetype;
        let name = contact.name || contact.pushname;

        let textResult = await gemini.geminiVision(
            userId,
            mediaBuffer,
            mimetype,
            userMessage,
            name
        );

        while (textResult === 'Fetch failed') {
            textResult = await gemini.geminiVision(
                userId,
                mediaBuffer,
                mimetype,
                userMessage,
                name
            );
        }
        if (textResult !== 'Fetch failed') {
            msg.reply(textResult);
        }
    }

    const contact = await msg.getContact();
    const userId = msg.from;
    const userMessage = msg.body;
    const chat = await msg.getChat();
    const isGroup = chat.isGroup;
    const isReadOnly = chat.isReadOnly;
    const isClear = msg.body.toLowerCase() === 'clear';
    const isClearAll = msg.body.toLowerCase() === 'clear all';
    const isImage = msg.hasMedia && msg.type === 'image';

    if (isClear) {
        await chatHistory.clearHistory(msg.from);
        client.sendMessage(msg.from, 'Chat history cleared');
    } else if (isClearAll) {
        await chatHistory.clearAllHistory();
        client.sendMessage(msg.from, 'All chat history cleared');
    } else if (
        !isGroup &&
        !msg.isStatus &&
        !isReadOnly &&
        msg.hasMedia &&
        msg.type === 'image'
    ) {
        await generateTextFromImage();
    } else if (!contact.name && !isGroup) {
        await generateTextFromText(contact.pushname);
    } else if (!isGroup && !msg.isStatus && !isReadOnly) {
        await generateTextFromText(contact.name);
    } else if (!contact.name && !isGroup && isImage) {
        await generateTextFromImage(contact.pushname);
    } else if (!isGroup && !msg.isStatus && isImage) {
        await generateTextFromImage(contact.name);
    }
});
