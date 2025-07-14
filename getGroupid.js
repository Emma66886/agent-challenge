import TelegramBot from "node-telegram-bot-api"
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.TELEGRAM_BOT_TOKEN)
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
telegramBot.on("message",(msg)=>{
    // console.log(msg);

})

// telegramBot.on("text",(msg)=>{
//     console.lgo(msg)
// })


telegramBot.on('inline_query', (query) => {
  const userInput = query.query; // text after @MytelegramBot

  // Create result(s) to show
  const results = [
    {
      type: 'article',
      id: '1',
      title: `You typed: "${userInput}"`,
      description: 'Click to send this message',
      input_message_content: {
        message_text: `Echo: ${userInput}`
      }
    }
  ];

  telegramBot.answerInlineQuery(query.id, results);
});

telegramBot.on("text",(msg)=>{
    const isCommandPresent = msg.text.toLowerCase().includes("/gettokendetails");
    if(!isCommandPresent) return;
    const otherMessages = msg.text.toLowerCase().trim().split("/gettokendetails").join("")
    console.log(otherMessages);
    if(otherMessages === ""){
        telegramBot.sendMessage(msg.chat.id, "Please provide a token mint address after the command. Example: /gettokendetails 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
        return;
    }
    telegramBot.sendMessage(msg.chat.id, `You typed: ${otherMessages[1]}`);

})

// setInterval(()=>telegramBot.sendMessage(process.env.TELEGRAM_ALERTS_GROUP_ID, "Hello from Jupiter!"), 10000);