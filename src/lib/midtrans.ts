import midtransClient from 'midtrans-client';

// Initialize api client object
export const snap = new midtransClient.Snap({
    isProduction : false,
    serverKey : process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY',
    clientKey : process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY'
});
