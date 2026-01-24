import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot("8019137303:AAG4gVds5TegxYCVjm6ycNHBd6u8QSYS5Wc", { polling: true });

function onMessage() {
    bot.on("message", (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text || "";
        if (text.includes("/start")) {
            //             sendCodeMessage(chatId, 
            //                 `
            // function f(a,b){
            //     return a + b;
            // }
            // f(10,20);
            //                 `, 
            //                 "js");

            // sendStyledMessage(chatId, "BAri or", "")
            // sendMessageWithButtons(chatId, "Ընտրիր մեկը:", [
            //     [
            //         { text: "Option 🇦🇲", callback_data: "opt1" },
            //     ],
            //     [
            //         { text: "Option 🇦🇲", callback_data: "opt2" }
            //     ]
            // ]);
        //     sendStyledMessage(chatId, "Բարի օր, ահա կոդը, համեցեք․", "b");
        //     sendCodeMessage(
        //         chatId,
        //         `
        // for(let i = 0; i < 20; i++){
        //     console.log(i)
        // }
        //         `,
        //         "js"
        //     )
        }
    });
}

function onButtonPress() {
    bot.on("callback_query", (query) => {
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const data = query.data; // callback_data արժեքը
        const user = query.from; // օգտագործողի info

        // Այստեղ կարող ես պատասխան ուղարկել Telegram-ին, որ տեսնեն սեղմել են
        bot.answerCallbackQuery(query.id);

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
