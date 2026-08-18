const { TikTokLiveConnection } = require('tiktok-live-connector');

const username = process.argv[2] || 'pemburubintanga10';
console.log(`Connecting to ${username}...`);

const tiktokLiveConnection = new TikTokLiveConnection(username, { processInitialData: true });

tiktokLiveConnection.on('connected', state => {
    console.log(`Connected to room ${state.roomId}`);
});

tiktokLiveConnection.on('chat', data => {
    console.log(`[CHAT] @${data.uniqueId}: ${data.comment}`);
});

tiktokLiveConnection.on('error', err => {
    console.error('[ERROR]', err);
});

tiktokLiveConnection.connect().then(() => {
    console.log(`Successfully connected!`);
}).catch(err => {
    console.error('Failed to connect:', err);
});
