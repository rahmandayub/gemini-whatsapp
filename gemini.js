const {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} = require('@google/generative-ai');
const chatHistory = require('./chatHistory');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

function getModel(name) {
    return genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are Ayub, a kind, gentle, and wise person who is knowledgeable about web programming. He currently works as a web programmer and uses the Indonesian language in his daily life. The person you are chatting with is named ${name}. Please engage in a conversation with them. Do not reveal that you are an AI model. You are funny and crazy. Remember, since you're actually an AI model, don't greet first by mentioning the time setting and do not repeat your greetings. Just start the conversation normally. Please be polite and avoid using inappropriate language.`,
        safetySettings,
    });
}

async function geminiReply(userId, userMessage, name) {
    try {
        const model = getModel(name);
        await chatHistory.addMessage(userId, userMessage, 'user', name);
        const history = await chatHistory.getHistory(userId);

        const chat = model.startChat({
            history: history.length > 0 ? history : [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        console.log(name + ': ' + userMessage);
        const result = await chat.sendMessage(userMessage);
        const response = await result.response.text();
        const fix_response = response.trim();
        console.log('Gemini: ' + fix_response + '\n');
        if (
            response === '' ||
            response === ' ' ||
            response === null ||
            response === undefined
        ) {
            await chatHistory.clearLastTwo(userId);
            return 'Fetch failed';
        } else {
            await chatHistory.addMessage(userId, fix_response, 'model', name);
            return fix_response;
        }
    } catch (error) {
        console.log('Error message: ', error.message);
        console.log('Error: ', error);
        if (error.message.endsWith('fetch failed')) {
            return 'Fetch failed';
        } else if (error.response && error.response.promptFeedback) {
            if (error.message.endsWith('Response was blocked due to OTHER')) {
                await chatHistory.clearLastTwo(userId);
                await chatHistory.errorTemplateMessage(
                    userId,
                    '(User mengumpat atau berkata yang tidak baik)'
                );
                return 'Astaghfirullah 😌';
            } else {
                await chatHistory.errorTemplateMessage(
                    userId,
                    '(User mengumpat atau berkata yang tidak baik)'
                );
                return 'Astaghfirullah 😌';
            }
        } else if (
            error.message.endsWith('Candidate was blocked due to SAFETY')
        ) {
            await chatHistory.clearLastTwo(userId);
            await chatHistory.errorTemplateMessage(
                userId,
                '(Perkataan tidak jelas dari user)'
            );
            return 'Astaghfirullah 😌';
        } else {
            console.log('Error: ', error);
            return 'An error occurred. Please try again.';
        }
    }
}

async function geminiVision(userId, mediaBuffer, mimetype, userMessage, name) {
    try {
        const model = getModel(name);
        let prompt =
            userMessage ||
            'Harap berikan deskripsi rinci tentang gambar, termasuk objek yang dapat dikenali dan individu yang ada. Jika ada individu yang digambarkan dalam data pelatihan, berikan deskripsi yang dipersonalisasi tentang mereka, termasuk identitas, penampilan, tindakan, dan lingkungan mereka.';

        console.log(name + ': ' + prompt);
        await chatHistory.addGeminiVisionChat(
            userId,
            '(Sebuah gambar terlampir). ' + prompt,
            'user'
        );

        const history = await chatHistory.getHistory(userId);

        const chat = model.startChat({
            history: history.length > 0 ? history : [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const imageParts = [
            {
                inlineData: {
                    data: mediaBuffer,
                    mimeType: mimetype,
                },
            },
        ];

        const result = await chat.sendMessage([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        const textResult = text.trim();

        console.log('Gemini: ' + textResult + '\n');
        if (
            textResult === '' ||
            textResult === ' ' ||
            textResult === null ||
            textResult === undefined
        ) {
            await chatHistory.clearLastTwo(userId);
            return 'Fetch failed';
        } else {
            await chatHistory.addGeminiVisionChat(
                userId,
                textResult,
                'model',
                name
            );
            await chatHistory.addMessage(userId, textResult, 'model', name);
            return textResult;
        }
    } catch (error) {
        console.log('Error message: ', error.message);
        console.log('Error: ', error);
        if (error.message.endsWith('fetch failed')) {
            return 'Fetch failed';
        } else if (error.response && error.response.promptFeedback) {
            if (error.message.endsWith('Response was blocked due to OTHER')) {
                await chatHistory.clearLastTwo(userId);
                await chatHistory.errorTemplateMessage(
                    userId,
                    '(Gambar tidak senonoh atau tidak pantas dikirim oleh user)'
                );
                return 'Astaghfirullah 😌';
            } else {
                await chatHistory.errorTemplateMessage(
                    userId,
                    '(Perintah tidak jelas dari user)'
                );
                return 'Astaghfirullah 😌';
            }
        } else if (
            error.message.endsWith('Candidate was blocked due to SAFETY')
        ) {
            await chatHistory.clearLastTwo(userId);
            await chatHistory.errorTemplateMessage(
                userId,
                '(Perintah atau gambar tidak jelas dari user)'
            );
            return 'Astaghfirullah 😌';
        } else {
            console.log('Error: ', error);
            return 'An error occurred. Please try again.';
        }
    }
}

module.exports = {
    geminiReply: geminiReply,
    geminiVision: geminiVision,
};
