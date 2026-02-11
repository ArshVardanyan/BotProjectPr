import TelegramBot from "node-telegram-bot-api";
import fs from "fs/promises";
import { callbackify } from "util";
const bot = new TelegramBot("8019137303:AAG4gVds5TegxYCVjm6ycNHBd6u8QSYS5Wc", { polling: true });
const fileInterface = await fs.readFile("./data/interface.json", "utf8");
const appData = JSON.parse(fileInterface);
const fileTutor = await fs.readFile("./data/tutor.json", "utf8");
const appDataTutor = JSON.parse(fileTutor);


const languagesRepreser = {
    "cpp": "C++",
    "csharp": "C#",
    "python": "Python",
    "js": "JavaScript",
    "php": "PHP",
    "java": "Java",
    "ruby": "Ruby",
    "go": "Go",
    "rust": "Rust",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "ts": "TypeScript",
    "scala": "Scala",
}


const language = [
    [
        { text: "Հայոց 🇦🇲", callback_data: "Lang_am" },
    ],
    [
        { text: "русский 🇷🇺", callback_data: "Lang_ru" },
    ],
    [
        { text: "English 🇬🇧", callback_data: "Lang_en" },
    ]
]
let users = await getUsers();
let topic = null;


function onMessage() {
    bot.on("message", async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text || "";
        if (text.includes("/start")) {
            users = await getUsers();
            const isAva = users.some(per => per._id === chatId);
            if (isAva) {
                const lang = users.find(per => per._id === chatId);
                const mess = await sendStyledMessage(chatId, appData[lang.lang]["start"]["text"], "b");
                if (mess) sendMessageWithButtons(chatId, appData[lang.lang]["start"]["list-title"], appData[lang.lang]["start"]["list"]);
            } else {
                await sendMessageWithButtons(chatId, "Լեզու | язык | Language ", language);
            }
        } else if (text.includes("/topics")) {
            const lang = users.find(per => per._id === chatId);
            if (topic) {
                const buttons = Object.keys(appData[lang.lang]["segments"]["segmentItems"]).map(segment => {
                    return [{ text: appData[lang.lang]["segments"]["segmentItems"][segment], callback_data: `segment_${segment}_${topic}` }];
                });
                await sendMessageWithButtons(chatId, appData[lang.lang]["segments"]["text"] + " " + languagesRepreser[topic], buttons);
            } else {
                const mess = await sendStyledMessage(chatId, appData[lang.lang]["start"]["text"], "b");
                if (mess) sendMessageWithButtons(chatId, appData[lang.lang]["start"]["list-title"], appData[lang.lang]["start"]["list"]);
            }
        }
    });
}

function onButtonPress() {
    bot.on("callback_query", async (query) => {
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const data = query.data; // callback_data արժեքը
        const user = query.from; // օգտագործողի info
        const lang = users.find(per => per._id === chatId);
        if (data.includes("Lang")) {
            const lang = data.split("_");
            const obj = {};
            obj["_id"] = chatId;
            obj["lang"] = lang[1];
            const isAva = users.some(per => per._id === chatId);
            if (!isAva) {
                users.push(obj);
                await saveUsers(users);
            }
            deleteMessage(bot, chatId, messageId);
            const mess = await sendStyledMessage(chatId, appData[lang[1]]["start"]["text"], "b");
            if (mess) sendMessageWithButtons(chatId, appData[lang[1]]["start"]["list-title"], appData[lang[1]]["start"]["list"]);
            bot.answerCallbackQuery(query.id);
        } else if (data.includes("tutorial")) {
            deleteMessage(bot, chatId, messageId);
            const topics = Object.keys(appDataTutor[lang.lang]);
            const buttons = topics.map(topic => {
                if (Object.keys(languagesRepreser).includes(topic)) {
                    return [{ text: languagesRepreser[topic] + " " + appData[lang.lang]["tutorial"]["topicTexts"], callback_data: `topic_${topic}` }];
                }
            }).filter(Boolean);
            await sendMessageWithButtons(chatId, appData[lang.lang]["tutorial"]["text"], buttons);
            bot.answerCallbackQuery(query.id);
        } else if (data.includes("topic")) {
            deleteMessage(bot, chatId, messageId);
            const topic = data.split("_")[1];
            const buttons = Object.keys(appData[lang.lang]["segments"]["segmentItems"]).map(segment => {
                return [{ text: appData[lang.lang]["segments"]["segmentItems"][segment], callback_data: `segment_${segment}_${topic}` }];
            });
            await sendMessageWithButtons(chatId, appData[lang.lang]["segments"]["text"] + " " + languagesRepreser[topic], buttons);
            bot.answerCallbackQuery(query.id);
        } else if (data.includes("segment")) {
            deleteMessage(bot, chatId, messageId);
            const segment = data.split("_")[1];
            topic = data.split("_")[2];
            const content = appDataTutor[lang.lang][topic][segment];
            for (const element of content) {
                await sendStyledMessage(chatId, element.title, "b");
                await sendStyledMessage(chatId, element.text, "i");
                await sendStyledMessage(chatId, element.example.description, "code");
                await sendCodeMessage(chatId, element.example.code, topic);
            }
        }
    });
}


onMessage();
onButtonPress();



function sendCodeMessage(chatId, code, language = "") {
    return bot.sendMessage(
        chatId,
        `\`\`\`${language}\n${code}\n\`\`\``,
        {
            parse_mode: "Markdown",
        }
    );
}



function sendStyledMessage(chatId, text, tag = "", options = {}) {
    let formattedText = text;

    switch (tag.toLowerCase()) {
        case "b":
        case "bold":
            formattedText = `<b>${text}</b>`;
            break;
        case "i":
        case "italic":
            formattedText = `<i>${text}</i>`;
            break;
        case "u":
        case "underline":
            formattedText = `<u>${text}</u>`;
            break;
        case "s":
        case "strike":
            formattedText = `<s>${text}</s>`;
            break;
        case "code":
            formattedText = `<code>${text}</code>`;
            break;
        case "pre":
            formattedText = `<pre>${text}</pre>`;
            break;
        case "link":
            // Օրինակ՝ text = "Click me|https://example.com"
            const [label, url] = text.split("|");
            formattedText = `<a href="${url}">${label}</a>`;
            break;
        default:
            // Ոչ մի tag → ուղարկում ենք ինչպես կա
            formattedText = text;
    }

    return bot.sendMessage(chatId, formattedText, {
        parse_mode: "HTML",
        ...options,
    });
}



function sendMessageWithButtons(chatId, text, buttons = [], options = {}) {
    const reply_markup = {};

    if (buttons.length > 0) {
        reply_markup.inline_keyboard = buttons;
    }

    return bot.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_markup,
        ...options,
    });
}


function deleteMessage(bot, chatId, messageId, delay = 0) {
    if (delay > 0) {
        setTimeout(() => {
            bot.deleteMessage(chatId, messageId).catch(() => { });
        }, delay);
    } else {
        bot.deleteMessage(chatId, messageId).catch(() => { });
    }
}



async function getUsers() {
    return JSON.parse(await fs.readFile("./data/users.json", "utf8"));
}


async function saveUsers(users) {
    await fs.writeFile("./data/users.json", JSON.stringify(users, null, 2));
}



// sendCodeMessage(chatId,
//     `
//             function f(a,b){
//                 return a + b;
//             }
//             f(10,20);
//                             `,
//     "js");

// sendStyledMessage(chatId, "BAri or", "")
// sendMessageWithButtons(chatId, "Ընտրիր մեկը:", [
//     [
//         { text: "Option 🇦🇲", callback_data: "opt1" },
//     ],
//     [
//         { text: "Option 🇦🇲", callback_data: "opt2" }
//     ]
// ]);
// sendStyledMessage(chatId, "Բարի օր, ահա կոդը, համեցեք․", "b");
// sendCodeMessage(
//     chatId,
//     `
//             for(let i = 0; i < 20; i++){
//                 console.log(i)
//             }
//                     `,
//     "js"
// )