const { TikTokLiveConnection } = require('tiktok-live-connector');

const username = process.argv[2] || 'tiktok';

let tiktokLiveConnection = new TikTokLiveConnection(username, {
          processInitialData: false,
          enableExtendedGiftInfo: false,
          enableWebsocketUpgrade: true,
          requestPollingIntervalMs: 2000,
          clientParams: {
            "app_language": "en-US",
            "device_platform": "web"
          }
});

console.log(`Connecting to ${username}...`);
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
});

let chatCount = 0;
tiktokLiveConnection.on('chat', data => {
    chatCount++;
    console.log(`${data.uniqueId} writes: ${data.comment}`);
    if (chatCount > 2) {
       process.exit(0);
    }
});

tiktokLiveConnection.on('error', err => {
    console.error('Error:', err);
});

setTimeout(() => {
    console.log(`Received ${chatCount} chats in 15 seconds.`);
    process.exit(0);
}, 15000);
