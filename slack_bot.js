// slack_bot.js
require("dotenv").config();
const { App } = require("@slack/bolt");

const knowledgeBase = require("./app/knowledge_base.json");
const regionData = require("./app/region_list.json");
const data = require("./app/data.json");

// Debug logging for environment variables
console.log("Environment variables check:");
console.log("SLACK_BOT_TOKEN exists:", !!process.env.SLACK_BOT_TOKEN);
console.log("SLACK_SIGNING_SECRET exists:", !!process.env.SLACK_SIGNING_SECRET);
console.log("SLACK_APP_TOKEN exists:", !!process.env.SLACK_APP_TOKEN);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,        
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,     
  socketMode: true,
  logLevel: 'DEBUG'
});

// Handle direct messages and mentions
app.message(async ({ message, say }) => {
  try {
    console.log("Received message:", message);
    
    // Ignore messages from bots to prevent loops
    if (message.bot_id || message.subtype) {
      console.log("Ignoring bot message or message with subtype");
      return;
    }

    const userText = message.text || "";
    const channelId = message.channel;
    const userId = message.user;

    console.log("Processing message - User ID:", userId, "Channel ID:", channelId);
    console.log("User said:", userText);

    const responseText = getBotResponse(userText);
    console.log("Bot responding with:", responseText);

    await say(responseText);
    console.log("Response sent successfully");

  } catch (err) {
    console.error("Error processing message:", err);
  }
});

// Error handling
app.error(async (error) => {
  console.error('An error occurred:', {
    message: error.message,
    stack: error.stack,
    code: error.code
  });
});

function getBotResponse(question) {
  console.log("Getting response for:", question);
  const lower = question.toLowerCase();

  if (lower.includes("screener/person/search") && lower.includes("region=")) {
    const regionRegex = /region\s*=\s*(.*)/i;
    const match = regionRegex.exec(question);
    if (match) {
      let regionRaw = match[1].trim();
      const regionList = regionData.regions;
      if (regionList.includes(regionRaw)) {
        return buildValidRequest(regionRaw);
      } else {
        const errorLog = `Error: Region "${regionRaw}" not found. Valid: ${regionList.join(", ")}`;
        const fixed = attemptFix(regionRaw, regionList);
        const finalRegion = fixed || "United States";
        return `Invalid region "${regionRaw}".\n${errorLog}\n` +
               (fixed ? `Auto-fixed => "${fixed}"\n` : `Falling back => "United States"\n`) +
               `Corrected request:\n` + buildValidRequest(finalRegion);
      }
    }
  }

  const kbAnswer = searchKnowledgeBase(lower);
  if (kbAnswer) return kbAnswer;

  if (lower.includes("search for people")) return data["search for people"];
  if (lower.includes("region")) return data["region"];
  if (lower.includes("email") || lower.includes("enrichment")) return data["email/enrichment"];
  return data["fallback"];
}

function buildValidRequest(regionVal) {
  return `curl --location 'https://api.crustdata.com/screener/person/search' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Token $YOUR_TOKEN' \\
--data '{
  "filters": [
    {
      "filter_type": "CURRENT_COMPANY",
      "type": "in",
      "value": ["openai.com"]
    },
    {
      "filter_type": "CURRENT_TITLE",
      "type": "in",
      "value": ["engineer"]
    },
    {
      "filter_type": "REGION",
      "type": "in",
      "value": ["${regionVal}"]
    }
  ],
  "page": 1
}'`;
}

function attemptFix(regionRaw, regionList) {
  if (regionRaw.toLowerCase().includes("san fran")) {
    const possible = "San Francisco, California, United States";
    if (regionList.includes(possible)) return possible;
  }
  return null;
}

function searchKnowledgeBase(userLower) {
  for (const entry of knowledgeBase.kb) {
    const questionWords = entry.question.toLowerCase().split(/\s+/);
    let matchCount = 0;
    for (const w of questionWords) {
      if (w.length > 3 && userLower.includes(w)) {
        matchCount++;
      }
    }
    if (matchCount > 2) {
      return entry.answer;
    }
  }
  return null;
}

// Start the app
(async () => {
  try {
    console.log("Starting Slack Bolt in Socket Mode...");
    await app.start();
    console.log("⚡️ Slack Bot is running in Socket Mode!");
    console.log("Ready to respond to messages...");
  } catch (error) {
    console.error("Failed to start Slack Bot:", error);
    process.exit(1);
  }
})();