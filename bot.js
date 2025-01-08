const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Create a new Discord client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Your bot token (replace this with your actual bot token)
const token = 'YOUR_BOT_TOKEN';

// The deployable links categorized
const links = {
    opensocial: [
        'https://opensocial.com',
        'https://opensocial.com/lesson/1',
    ],
    codehs: [
        'https://codehs.com',
        'https://codehs.com/lesson/1',
        'https://codehs.com/lesson/2',
    ],
    playcode: [
        'https://playcode.io',
        'https://playcode.io/lesson/1',
    ],
    github: [
        'https://github.com',
        'https://github.com/repo/1',
    ],
    vercel: [
        'https://vercel.com',
        'https://vercel.com/lesson/1',
    ],
    htmlCafe: [
        'https://htmlcafe.com',
        'https://htmlcafe.com/lesson/1',
    ],
    cdnNet: [
        'https://cdn.net',
        'https://cdn.net/lesson/1',
    ]
};

// File to store user deployment history
const userDataFile = './userData.json';

// Read existing user data if it exists
let userData = fs.existsSync(userDataFile) ? JSON.parse(fs.readFileSync(userDataFile, 'utf8')) : {};

// Function to save user data
const saveUserData = () => {
    fs.writeFileSync(userDataFile, JSON.stringify(userData, null, 2));
};

// Bot is online
client.once('ready', () => {
    console.log('Bot is online!');
});

// Handle the link command
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const command = message.content.trim().toLowerCase().split(' ')[0];
    const userId = message.author.id;

    if (command === '!link') {
        // Show the options for the user to choose from
        const options = Object.keys(links).join(', ');
        message.reply(`Please choose a category to deploy a link from: ${options}. Type \`!link <category>\` to select.`);
    }

    if (command.startsWith('!link ')) {
        const category = message.content.trim().split(' ')[1];

        // Check if the category is valid
        if (!category || !links[category]) {
            message.reply('Please specify a valid category: `opensocial`, `codehs`, `playcode`, `github`, `vercel`, `htmlCafe`, or `cdnNet`.');
            return;
        }

        // Check if the user can deploy again (30-day cooldown)
        const lastDeployDate = userData[userId] ? userData[userId].lastDeploy : null;
        const now = Date.now();
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

        // If the user is still on cooldown
        if (lastDeployDate && now - lastDeployDate < thirtyDaysInMs) {
            const remainingTime = thirtyDaysInMs - (now - lastDeployDate);
            const hoursRemaining = Math.floor(remainingTime / (1000 * 60 * 60));
            message.reply(`You need to wait ${hoursRemaining} hours before you can deploy another link.`);
            return;
        }

        // Select a random link from the category
        const selectedLink = links[category][Math.floor(Math.random() * links[category].length)];

        // Deploy the link
        message.reply(`Deploying link from ${category}: ${selectedLink}`);

        // Update the user's last deployment date
        if (!userData[userId]) {
            userData[userId] = {};
        }
        userData[userId].lastDeploy = now;

        // Save the data to a file
        saveUserData();
    }
});

// Log in to Discord with your bot's token
client.login(token);
