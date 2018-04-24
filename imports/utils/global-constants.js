
export const APP_NAME             = 'Cryptolypmic Torch';
export const APP_VERSION          = 'v1.1.0';

export const MINIMUM_TORCH_PRICE = new BigNumber(0.005);    // ETH
export const DEFAULT_TORCH_PRICE = new BigNumber(1);        // ETH

export const ACCOUNT_WATCH_INTERVAL   = 1000;
export const CONTRACT_WATCH_INTERVAL  = 5000;
export const RECEIPT_WATCH_INTERVAL   = 1000;
export const OWNTHEDAY_WATCH_INTERVAL = 30000;

export const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const MEDAL_CLASSNAME_XS = ['gold-medal-xs', 'silver-medal-xs', 'bronze-medal-xs'];
export const MEDAL_CLASSNAME_SM = ['gold-medal-sm', 'silver-medal-sm', 'bronze-medal-sm'];

export const ADDRESS_DISPLAY_LENGTH = 12;

export const LEADERBOARD_LIMIT = 3;

export const CONTRACT_ADDRESS = {
    TORCH : {
        '1'    : '...',  // Main
        '3'    : '0x9e873447260dea819b094B3127a3EfAf61aD368E', // Ropsten
        '5777' : '0x30753e4a8aad7f8597332e813735def5dd395028'  // Ganache
    },
    TOKEN : {
        '1'    : '...',  // Main
        '3'    : '0x56ef06415702294a05cF6E0905Be1867659aBe19', // Ropsten
        '5777' : '0x2c2b9c9a4a25e24b174f26114e8926a9f2128fe4'  // Ganache
    }
};
