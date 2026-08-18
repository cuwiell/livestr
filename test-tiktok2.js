const { TikTokLiveConnection } = require('tiktok-live-connector');

// Let's test with a username that might be live.
const usernames = process.argv.slice(2);
if (usernames.length === 0) usernames.push('aljazeeraenglish');

async function testConnection(username) {
    let tiktokLiveConnection = new TikTokLiveConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: false,
        enableWebsocketUpgrade: false, // try without websocket
        requestPollingIntervalMs: 2000,
    });

    console.log(`Connecting to ${username}...`);
    try {
        const state = await tiktokLiveConnection.connect();
        console.info(`Connected to roomId ${state.roomId}`);
        
        let chatCount = 0;
        tiktokLiveConnection.on('chat', data => {
            chatCount++;
            console.log(`[${username}] ${data.uniqueId}: ${data.comment}`);
            if (chatCount > 3) {
                console.log('Success! Got chats.');
                process.exit(0);
            }
        });
        
        setTimeout(() => {
            console.log(`[${username}] Timeout. Received ${chatCount} chats.`);
            process.exit(0);
        }, 15000);
        
    } catch (err) {
        console.error(`Failed to connect to ${username}`, err.message);
        process.exit(1);
    }
}

testConnection(usernames[0]);
