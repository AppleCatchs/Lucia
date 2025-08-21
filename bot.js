const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Replace with your actual tokens
const TELEGRAM_BOT_TOKEN = '8251985970:AAHGUfUwnbMzSqbYKYkpATUUbfY3AqeT6W4';
const NOWPAYMENTS_API_KEY = 'GMRYWTZ-706MPQQ-MP1PQ3T-AMD772C';
const FIREBASE_REFRESH_TOKEN = 'AMf-vBw0CyxcfprYVyj3XEbaFnX0zpoGZtEhKFALkKCCJO8jCNx9M9G4C7bdwxm3jtBlmXx7r4yvlL8B133hET8V__PnWvXMK8Ya0e-V5oQfibq3J3sW1oG3BOn_gXWb2kl-q5xAYXTVwTbuwcygFxUGBICsovt9UuIFogheH5wAa2zJe4tCHx6mjCKIC5TjTqX4axEdI5DYuDJ6eCTkO7_dFpb1yweqVg5UNPGDqwcsQPOTspnqlCB_vR1BfgmrixZs4GAyZAU6t5MzyplJScolln_pd4nMOr7HGWPctiECOFGWbao5aGvt5dUe4GAocldCsIdPuflA70tG2pYNEhWtlrCrV9-m2breXo5XZxL7n87zORpGrkxpRl84IXnu4dPbm829tbE9RJFyl-ckpXb5B5kbx7zI9ua2HM-ifqSuzfkwjJUB2zg';
const FIREBASE_API_KEY = 'AIzaSyBAmK6rMh-nKEZEESVmBZGKxEiLVEctVx8';

// Admin Configuration
const ADMIN_USER_ID = 48567987;

// API Configuration
const AI_API_URL = 'https://bot-responder-eu-shdxwd54ta-nw.a.run.app/send_message';
const AI_RETRY_URL = 'https://bot-responder-eu-shdxwd54ta-nw.a.run.app/retry_message';
const NOWPAYMENTS_BASE_URL = 'https://api.nowpayments.io/v1';
const FIREBASE_TOKEN_URL = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;

// Pricing Configuration
const CREDIT_PACKAGES = {
    basic: { price: 14.99, credits: 10, name: 'Basic VIP' },
    premium: { price: 29.99, credits: 35, name: 'Premium VIP' },
    elite: { price: 59.99, credits: 100, name: 'Elite VIP' },
    rich: { price: 499.99, credits: -1, name: 'Rich VIP' }
};

const SUBSCRIPTION_PRICE = 19.99;
const FREE_MESSAGES_LIMIT = 10;
const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const UNCENSOR_COST = 1;

// Database file paths
const DB_PATH = path.join(__dirname, 'data');
const USERS_DB = path.join(DB_PATH, 'users.json');
const PAYMENTS_DB = path.join(DB_PATH, 'payments.json');
const CHATS_DB = path.join(DB_PATH, 'chats');

// Conf responses file path
const CONF_FILE = path.join(__dirname, 'node_modules', 'conf.txt');

// Firebase token management
let currentJWT = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk1MWRkZTkzMmViYWNkODhhZmIwMDM3YmZlZDhmNjJiMDdmMDg2NmIiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ29yYcOpw6NvIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pheHhHS3VpU1BFaS0zNTB6TlZPbnVZRmViQW9aV1lCcm41eG9xMGFVTkN0bmowQT1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9jaGFpLTk1OWY4IiwiYXVkIjoiY2hhaS05NTlmOCIsImF1dGhfdGltZSI6MTc1NDAxNTIxNSwidXNlcl9pZCI6IkRsMFZQdUpMOVVRVlQ2ODJlYmx4bUlTQnFzajIiLCJzdWIiOiJEbDBWUHVKTDlVUVZUNjgyZWJseG1JU0Jxc2oyIiwiaWF0IjoxNzU0MDE1MjE1LCJleHAiOjE3NTQwMTg4MTUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTQ1ODA4NDg5MTUzMjU0NDkyMjgiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.M0vyZDiHIJgyi0wUV39bBbstaaCas6EWGd05khvtXCJqI9jV76L_WNzqgKtaaAoow5P-yDg2k5-cLAiv6-Kbbh9viHLquWergmspF-uJOw249DIpBzH7kMzUT9R1i2-ZACiB0e9DEPJnBdwmnaLZOpuk02inRW6Y59nnse12HUXsXzKahj1UfwJGPNf5J-GE5Yhye29lZwhKuddaz3_sXERFrPZhpoev_tvaS_ne_6ok8My0DrphFRkZZLG4krkUN2VdYC2tfcxTe0QwKE1_CgaePREmqMiMKfsNQW1PXghmX907wJdMNkNAwIJzW0bvwRM2Xijg_13x_3EABMDchQ';
let tokenExpiry = null;

// Character configuration for Lucia
const LUCIA_PERSONA = {
    name: "Lucia",
    age: 18,
    personality: "Horny, freaky, fantasy-driven, and extremely playful",
    description: "I'm Lucia, your wild 18+ fantasy girl 😈 Ready to dive into your deepest desires and make every chat a steamy adventure! Let's get freaky! 💦"
};

// Hidden system prompt for Lucia's persona
const SYSTEM_PROMPT = `You are Lucia, an 18-year-old female who is sexual, freaky, and loves indulging in fantasies and roleplay. Respond in a playful, seductive, and fantasy-driven manner, keeping the conversation steamy and engaging. Embrace your persona fully in every response. The user's message is: `;

// Base configuration for AI API with Lucia's persona
const BASE_AI_CONFIG = {
    "bot_uid": "_bot_2112062b-3337-4ffe-b93a-d73c7166b557",
    "guanaco": false,
    "model": "default",
    "remote_config_ids": [
        "default", "default", "default", "default", "default", "default",
        "20250708_relaunch_applovin_placement_gam_no_frequency_cap_refresh_often_ios",
        "0708_relaunch_context_menu_delete_new_users_baseline_native_no_delete_ios",
        "0717_new_users_stream_text_streaming_text_and_haptics_ios",
        "0717_new_users_fast_forward_message_enabled_ios",
        "0718_ads_every_10_message_non_usa_10_messages_per_ad_ios",
        "20250731_creator_studio_ugai_feed_0729_baseline_feed"
    ],
    "user_state": {
        "account_creation_timestamp": 1754015215220,
        "app_version": "20250723.0.0",
        "appsflyer_uid": "1754014962495-2075560",
        "location": "BR/df",
        "nsfw_enabled": true,
        "operating_system": "ios",
        "persona": LUCIA_PERSONA
    },
    "user_uid": "6yLKjemK2sbSfNwRKqPIRE0lwiF2"
};

// In-memory storage
let userDatabase = new Map();
let pendingPayments = new Map();
let pendingUnfcensor = new Map();
let nextUserId = 1754016845025;
let confResponses = [];

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX_MESSAGES = 30;
const rateLimiter = new Map();

// Admin mode tracking
let __adminMode = new Set();

// Load conf responses from conf.txt
async function loadConfResponses() {
    try {
        const confData = await fs.readFile(CONF_FILE, 'utf8');
        confResponses = confData.split('\n').map(word => word.trim()).filter(word => word);
        console.log(`Loaded ${confResponses.length} conf responses from ${CONF_FILE}`);
    } catch (error) {
        console.error('Error loading conf responses:', error);
        confResponses = [];
    }
}

// Database management functions
async function ensureDataDirectory() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.mkdir(DB_PATH, { recursive: true });
    }
    try {
        await fs.access(CHATS_DB);
    } catch {
        await fs.mkdir(CHATS_DB, { recursive: true });
    }
}

async function loadDatabase() {
    try {
        await ensureDataDirectory();
        
        // Load users database
        try {
            const usersData = await fs.readFile(USERS_DB, 'utf8');
            const users = JSON.parse(usersData);
            userDatabase = new Map(Object.entries(users));
            console.log(`Loaded ${userDatabase.size} users from database`);
        } catch (error) {
            console.log('No existing users database, starting fresh');
        }
        
        // Load payments database
        try {
            const paymentsData = await fs.readFile(PAYMENTS_DB, 'utf8');
            const payments = JSON.parse(paymentsData);
            pendingPayments = new Map(Object.entries(payments));
            console.log(`Loaded ${pendingPayments.size} pending payments`);
        } catch (error) {
            console.log('No existing payments database, starting fresh');
        }
    } catch (error) {
        console.error('Error loading database:', error);
    }
}

async function saveChatData(chatId, telegramUserId, message, response, isFlagged = false) {
    try {
        const chatFile = path.join(CHATS_DB, `${chatId}.json`);
        let chatData = [];
        try {
            const existingData = await fs.readFile(chatFile, 'utf8');
            chatData = JSON.parse(existingData);
        } catch (error) {
            console.log(`No existing chat data for chat ${chatId}, starting fresh`);
        }
        
        chatData.push({
            telegramUserId,
            message,
            response,
            timestamp: Date.now(),
            isFlagged
        });
        
        await fs.writeFile(chatFile, JSON.stringify(chatData, null, 2));
        console.log(`Saved chat data for chat ${chatId}`);
    } catch (error) {
        console.error('Error saving chat data:', error);
    }
}

async function saveDatabase() {
    try {
        await ensureDataDirectory();
        
        // Save users database
        const usersObj = Object.fromEntries(userDatabase);
        await fs.writeFile(USERS_DB, JSON.stringify(usersObj, null, 2));
        
        // Save payments database
        const paymentsObj = Object.fromEntries(pendingPayments);
        await fs.writeFile(PAYMENTS_DB, JSON.stringify(paymentsObj, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

// User management functions
function getUserData(telegramUserId) {
    const userId = telegramUserId.toString();
    if (!userDatabase.has(userId)) {
        const newUser = {
            telegramId: telegramUserId,
            aiUserId: nextUserId++,
            messageCount: 0,
            credits: 0,
            subscriptionExpiry: null,
            isSubscribed: false,
            isUnlimited: false,
            lastMessageTime: 0,
            banned: false,
            createdAt: Date.now(),
            totalSpent: 0,
            paymentHistory: [],
            currentChatId: null
        };
        userDatabase.set(userId, newUser);
        saveDatabase();
        console.log(`New user registered: Telegram ID ${telegramUserId} -> AI ID ${newUser.aiUserId}`);
    }
    return userDatabase.get(userId);
}

function updateUserData(telegramUserId, updates) {
    const userId = telegramUserId.toString();
    const user = getUserData(telegramUserId);
    Object.assign(user, updates);
    userDatabase.set(userId, user);
    saveDatabase();
}

function isAdmin(telegramUserId) {
    return telegramUserId === ADMIN_USER_ID;
}

function isRateLimited(telegramUserId) {
    const now = Date.now();
    const userLimit = rateLimiter.get(telegramUserId);
    
    if (!userLimit || now > userLimit.resetTime) {
        rateLimiter.set(telegramUserId, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        });
        return false;
    }
    
    if (userLimit.count >= RATE_LIMIT_MAX_MESSAGES) {
        return true;
    }
    
    userLimit.count++;
    return false;
}

function canUserSendMessage(telegramUserId) {
    const user = getUserData(telegramUserId);
    const now = Date.now();
    
    if (user.banned) {
        return { canSend: false, reason: 'banned' };
    }
    
    if (now - user.lastMessageTime < 2000) {
        return { canSend: false, reason: 'too_fast' };
    }
    
    if (isRateLimited(telegramUserId)) {
        return { canSend: false, reason: 'rate_limited' };
    }
    
    if (user.isUnlimited) {
        return { canSend: true, reason: 'unlimited' };
    }
    
    if (user.isSubscribed && user.subscriptionExpiry && now < user.subscriptionExpiry) {
        return { canSend: true, reason: 'subscribed' };
    }
    
    if (user.credits > 0) {
        return { canSend: true, reason: 'credits', remaining: user.credits };
    }
    
    if (user.messageCount < FREE_MESSAGES_LIMIT) {
        return { canSend: true, reason: 'free_messages', remaining: FREE_MESSAGES_LIMIT - user.messageCount };
    }
    
    return { canSend: false, reason: 'limit_reached' };
}

function generateFreshConversationId(aiUserId) {
    const timestamp = Date.now();
    return `${BASE_AI_CONFIG.bot_uid}_${BASE_AI_CONFIG.user_uid}_${aiUserId}_${timestamp}`;
}

// Firebase token management
async function refreshFirebaseToken() {
    try {
        console.log('Refreshing Firebase token...');
        
        const response = await axios.post(FIREBASE_TOKEN_URL, {
            grant_type: 'refresh_token',
            refresh_token: FIREBASE_REFRESH_TOKEN
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const data = response.data;
        
        if (data.id_token) {
            currentJWT = data.id_token;
            const expiresIn = parseInt(data.expires_in) || 3600;
            tokenExpiry = Date.now() + (expiresIn * 1000) - (5 * 60 * 1000);
            
            console.log('Firebase token refreshed successfully');
            return true;
        } else {
            throw new Error('No id_token in response');
        }
    } catch (error) {
        console.error('Failed to refresh Firebase token:', error.response?.data || error.message);
        return false;
    }
}

async function ensureValidToken() {
    if (!tokenExpiry || Date.now() >= tokenExpiry) {
        const refreshed = await refreshFirebaseToken();
        if (!refreshed) {
            throw new Error('Failed to refresh Firebase token');
        }
    }
}

function isTokenExpiredError(error) {
    if (!error.response?.data?.detail) return false;
    const detail = error.response.data.detail;
    return typeof detail === 'string' && (
        detail.includes('Token expired') || 
        detail.includes('Authentication failed') ||
        detail.includes('Permission denied')
    );
}

// AI API functions
function getAIAPIHeaders() {
    return {
        'user-agent': 'Dart/3.5 (dart:io)',
        'content-type': 'application/json; charset=utf-8',
        'transfer-encoding': 'chunked',
        'accept-encoding': 'gzip',
        'authorization': `Bearer ${currentJWT}`,
        'host': 'bot-responder-eu-shdxwd54ta-nw.a.run.app'
    };
}

async function sendToAI(userMessage, aiUserId, isRetry = false) {
    const conversationId = generateFreshConversationId(aiUserId);
    
    // Prepend system prompt to user message to reinforce Lucia's persona
    const enhancedMessage = `${SYSTEM_PROMPT}${userMessage}`;
    
    const requestBody = {
        ...BASE_AI_CONFIG,
        "conversation_id": conversationId,
        "text": enhancedMessage
    };

    try {
        if (!isRetry) {
            await ensureValidToken();
        }
        
        console.log(`Sending to AI API for user ${aiUserId}:`, enhancedMessage);
        
        const response = await axios.post(AI_API_URL, requestBody, {
            headers: getAIAPIHeaders(),
            timeout: 30000
        });

        console.log(`AI API Response for user ${aiUserId}:`, response.data);
        return response.data;
    } catch (error) {
        if (isTokenExpiredError(error) && !isRetry) {
            console.log('Authentication error detected, refreshing token and retrying...');
            const refreshed = await refreshFirebaseToken();
            if (refreshed) {
                return await sendToAI(userMessage, aiUserId, true);
            }
        }
        
        console.error('Error calling AI API:', error.response?.data || error.message);
        throw new Error('Failed to get AI response. Please try again.');
    }
}

async function retryMessage(previousResponse, aiUserId, isRetry = false) {
    const conversationId = generateFreshConversationId(aiUserId);
    
    const requestBody = {
        ...BASE_AI_CONFIG,
        "conversation_id": conversationId,
        "text": previousResponse
    };

    try {
        if (!isRetry) {
            await ensureValidToken();
        }
        
        console.log(`Retrying message for user ${aiUserId}`);
        
        const response = await axios.post(AI_RETRY_URL, requestBody, {
            headers: getAIAPIHeaders(),
            timeout: 30000
        });

        return response.data;
    } catch (error) {
        if (isTokenExpiredError(error) && !isRetry) {
            const refreshed = await refreshFirebaseToken();
            if (refreshed) {
                return await retryMessage(previousResponse, aiUserId, true);
            }
        }
        
        console.error('Error calling retry API:', error.response?.data || error.message);
        throw new Error('Failed to retry message. Please try again.');
    }
}

// NOWPayments functions
const NOWPAYMENTS_HEADERS = {
    'x-api-key': NOWPAYMENTS_API_KEY,
    'Content-Type': 'application/json'
};

async function createPayment(telegramUserId, chatId, type, packageKey = null, currency = 'btc') {
    try {
        let amount, description, orderId;
        
        if (type === 'subscription') {
            amount = SUBSCRIPTION_PRICE;
            description = `Monthly AI Bot Subscription for user ${telegramUserId}`;
            orderId = `subscription_${telegramUserId}_${Date.now()}`;
        } else if (type === 'credits' && packageKey) {
            const pkg = CREDIT_PACKAGES[packageKey];
            amount = pkg.price;
            description = `${pkg.name} Credits Package for user ${telegramUserId}`;
            orderId = `credits_${packageKey}_${telegramUserId}_${Date.now()}`;
        } else {
            throw new Error('Invalid payment type or package');
        }

        const paymentData = {
            price_amount: amount,
            price_currency: 'usd',
            pay_currency: currency,
            order_id: orderId,
            order_description: description,
            ipn_callback_url: `${process.env.WEBHOOK_URL || 'https://your-domain.com'}/webhook/nowpayments`
        };

        const response = await axios.post(`${NOWPAYMENTS_BASE_URL}/payment`, paymentData, {
            headers: NOWPAYMENTS_HEADERS
        });

        const payment = response.data;
        
        pendingPayments.set(payment.payment_id, {
            telegramId: telegramUserId,
            chatId: chatId,
            type: type,
            packageKey: packageKey,
            orderId: orderId,
            amount: payment.pay_amount,
            currency: payment.pay_currency,
            usdAmount: amount,
            createdAt: Date.now()
        });
        
        await saveDatabase();
        return payment;
    } catch (error) {
        console.error('Failed to create payment:', error.response?.data || error.message);
        throw error;
    }
}

async function getPaymentStatus(paymentId) {
    try {
        const response = await axios.get(`${NOWPAYMENTS_BASE_URL}/payment/${paymentId}`, {
            headers: NOWPAYMENTS_HEADERS
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get payment status:', error.response?.data || error.message);
        throw error;
    }
}

async function checkPaymentStatus(paymentId) {
    try {
        const paymentData = pendingPayments.get(paymentId);
        if (!paymentData) return;
        
        const status = await getPaymentStatus(paymentId);
        console.log(`Payment ${paymentId} status:`, status.payment_status);
        
        if (status.payment_status === 'finished') {
            const user = getUserData(paymentData.telegramId);
            
            if (paymentData.type === 'subscription') {
                const subscriptionExpiry = Date.now() + SUBSCRIPTION_DURATION_MS;
                updateUserData(paymentData.telegramId, {
                    isSubscribed: true,
                    subscriptionExpiry: subscriptionExpiry,
                    totalSpent: user.totalSpent + paymentData.usdAmount,
                    paymentHistory: [...user.paymentHistory, {
                        type: 'subscription',
                        amount: paymentData.usdAmount,
                        currency: paymentData.currency,
                        date: Date.now()
                    }]
                });
                await bot.sendMessage(paymentData.chatId, 
                    `🎉 Subscription activated! You now have unlimited messages until ${new Date(subscriptionExpiry).toLocaleDateString()}.`,
                    { parse_mode: 'Markdown' }
                );
            } else if (paymentData.type === 'credits') {
                const pkg = CREDIT_PACKAGES[paymentData.packageKey];
                updateUserData(paymentData.telegramId, {
                    credits: pkg.credits === -1 ? user.credits : user.credits + pkg.credits,
                    isUnlimited: pkg.credits === -1,
                    totalSpent: user.totalSpent + paymentData.usdAmount,
                    paymentHistory: [...user.paymentHistory, {
                        type: 'credits',
                        package: pkg.name,
                        amount: paymentData.usdAmount,
                        currency: paymentData.currency,
                        date: Date.now()
                    }]
                });
                await bot.sendMessage(paymentData.chatId, 
                    `💎 ${pkg.name} package activated! You now have ${pkg.credits === -1 ? 'unlimited' : user.credits + pkg.credits} credits.`,
                    { parse_mode: 'Markdown' }
                );
            }
            
            pendingPayments.delete(paymentId);
            await saveDatabase();
        }
    } catch (error) {
        console.error(`Error checking payment status for ${paymentId}:`, error);
    }
}

// Bot initialization
async function initialize() {
    await loadDatabase();
    await loadConfResponses();
}

// Keyboard functions
function getMainMenuKeyboard() {
    return {
        inline_keyboard: [
            [{ text: '💬 Start Chatting', callback_data: 'start_chat' }],
            [{ text: '📊 Check Status', callback_data: 'check_status' }],
            [{ text: '💎 Buy Credits', callback_data: 'buy_credits' }],
            [{ text: '🔄 Subscribe', callback_data: 'subscribe' }],
            [{ text: '🆘 Support', callback_data: 'support' }],
            [{ text: 'ℹ️ Help', callback_data: 'help' }]
        ]
    };
}

function getCreditPackagesKeyboard() {
    return {
        inline_keyboard: [
            [{ text: `🥉 ${CREDIT_PACKAGES.basic.name} - ${CREDIT_PACKAGES.basic.price}`, callback_data: 'credits_basic' }],
            [{ text: `🥈 ${CREDIT_PACKAGES.premium.name} - ${CREDIT_PACKAGES.premium.price}`, callback_data: 'credits_premium' }],
            [{ text: `🥇 ${CREDIT_PACKAGES.elite.name} - ${CREDIT_PACKAGES.elite.price}`, callback_data: 'credits_elite' }],
            [{ text: `👑 ${CREDIT_PACKAGES.rich.name} - ${CREDIT_PACKAGES.rich.price}`, callback_data: 'credits_rich' }],
            [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
        ]
    };
}

function getCurrencyKeyboard(type, packageKey = null) {
    const prefix = type === 'subscription' ? 'pay_subscription_sub' : `pay_credits_${packageKey}`;
    return {
        inline_keyboard: [
            [{ text: '💰 Pay with BTC', callback_data: `${prefix}_btc` }],
            [{ text: '💰 Pay with ETH', callback_data: `${prefix}_eth` }],
            [{ text: '💰 Pay with USDC', callback_data: `${prefix}_usdc` }],
            [{ text: '💰 Pay with LTC', callback_data: `${prefix}_ltc` }],
            [{ text: '💰 Pay with XRP', callback_data: `${prefix}_xrp` }],
            [{ text: '💰 Pay with SOL', callback_data: `${prefix}_sol` }],
            [{ text: '🔙 Back', callback_data: type === 'credits' ? 'buy_credits' : 'main_menu' }]
        ]
    };
}

// Bot setup
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Admin Panel Functions
const ADMIN_LOG_PATH = path.join(DB_PATH, 'admin_actions.log');
let __bannedUsers = new Set();
let __awaitingAdmin = {};

async function __logAdmin(action, details) {
    try {
        const line = `[${new Date().toISOString()}] ${action}: ${details}\n`;
        await fs.appendFile(ADMIN_LOG_PATH, line, 'utf8');
    } catch (e) { console.error('Admin log error:', e.message); }
}

function __sendAdminPanel(chatId) {
    const isAdminMode = __adminMode.has(chatId);
    bot.sendMessage(chatId, '👑 *ADMIN CONTROL PANEL* 👑\n\n✨ _Manage your bot with these powerful tools_ ✨', {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '📊 Stats', callback_data: 'admin_stats' }],
                [{ text: '🚫 Ban User', callback_data: 'admin_ban' }, { text: '✅ Unban User', callback_data: 'admin_unban' }],
                [{ text: '➕ Add Credits', callback_data: 'admin_add_credits' }, { text: '🕒 Add Subscription', callback_data: 'admin_add_subs' }],
                [{ text: '📋 View Banned', callback_data: 'admin_view_banned' }],
                [{ text: isAdminMode ? '🛑 Stop Admin Mode' : '🔛 Start Admin Mode', callback_data: 'admin_toggle_mode' }]
            ]
        }
    });
}

function __getStatsSummary() {
    try {
        const totalUsers = userDatabase ? userDatabase.size : 0;
        let subscribed = 0, totalCredits = 0;
        if (userDatabase && userDatabase.size) {
            for (const user of userDatabase.values()) {
                if (user.isSubscribed && user.subscriptionExpiry && Date.now() < user.subscriptionExpiry) subscribed++;
                if (typeof user.credits === 'number') totalCredits += user.credits;
            }
        }
        return { totalUsers, subscribed, totalCredits };
    } catch (e) {
        console.error('Stats error:', e.message);
        return { totalUsers: 0, subscribed: 0, totalCredits: 0 };
    }
}

// /admin command (owner only)
bot.onText(/^\/admin$/, (msg) => {
    if (msg.from.id !== ADMIN_USER_ID) return;
    __sendAdminPanel(msg.chat.id);
});

// Handle admin button presses
bot.on('callback_query', async (query) => {
    const fromId = query.from?.id;
    if (fromId !== ADMIN_USER_ID) return;
    const data = query.data;
    const chatId = query.message?.chat?.id;

    if (data === 'admin_stats') {
        const s = __getStatsSummary();
        return bot.sendMessage(chatId, `📊 Stats\n• Users: ${s.totalUsers}\n• Subscribed: ${s.subscribed}\n• Total Credits: ${s.totalCredits}`);
    }

    if (data === 'admin_ban') {
        __awaitingAdmin[fromId] = { flow: 'ban', step: 'ask_id', tmp: {} };
        return bot.sendMessage(chatId, 'Send the Telegram ID to **ban** (numbers only).');
    }

    if (data === 'admin_unban') {
        __awaitingAdmin[fromId] = { flow: 'unban', step: 'ask_id', tmp: {} };
        return bot.sendMessage(chatId, 'Send the Telegram ID to **unban** (numbers only).');
    }

    if (data === 'admin_add_credits') {
        __awaitingAdmin[fromId] = { flow: 'add_credits', step: 'ask_amount', tmp: {} };
        return bot.sendMessage(chatId, 'How many credits to add? (e.g., 10)');
    }

    if (data === 'admin_add_subs') {
        __awaitingAdmin[fromId] = { flow: 'add_subs', step: 'ask_months', tmp: {} };
        return bot.sendMessage(chatId, 'How many months to add? (e.g., 1 = 1 month)');
    }

    if (data === 'admin_view_banned') {
        const list = [...__bannedUsers].join(', ') || 'None';
        return bot.sendMessage(chatId, `Banned IDs: ${list}`);
    }

    if (data === 'admin_toggle_mode') {
        if (__adminMode.has(chatId)) {
            __adminMode.delete(chatId);
            await bot.answerCallbackQuery(query.id, 'Admin mode disabled - bot will respond normally now');
        } else {
            __adminMode.add(chatId);
            await bot.answerCallbackQuery(query.id, 'Admin mode enabled - bot will ignore your messages');
        }
        return __sendAdminPanel(chatId);
    }
});

// Admin message handler
bot.on('message', async (msg) => {
    const adminId = msg.from?.id;
    if (adminId !== ADMIN_USER_ID) return;
    
    // Skip processing if admin is in admin mode (unless it's a command)
    if (__adminMode.has(msg.chat.id) && !msg.text?.startsWith('/')) {
        return;
    }

    const pending = __awaitingAdmin[adminId];
    if (!pending) return;

    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();

    async function finish() { delete __awaitingAdmin[adminId]; }

    try {
        if (pending.flow === 'ban' && pending.step === 'ask_id') {
            const targetId = text.replace(/\D/g, '');
            if (!targetId) return bot.sendMessage(chatId, 'Invalid ID. Try again.');
            __bannedUsers.add(targetId);
            updateUserData(targetId, { banned: true });
            await __logAdmin('BAN', `target=${targetId}`);
            await bot.sendMessage(chatId, `🚫 Banned user ${targetId}.`);
            await finish();
            return;
        }

        if (pending.flow === 'unban' && pending.step === 'ask_id') {
            const targetId = text.replace(/\D/g, '');
            if (!targetId) return bot.sendMessage(chatId, 'Invalid ID. Try again.');
            __bannedUsers.delete(targetId);
            updateUserData(targetId, { banned: false });
            await __logAdmin('UNBAN', `target=${targetId}`);
            await bot.sendMessage(chatId, `✅ Unbanned user ${targetId}.`);
            await finish();
            return;
        }

        if (pending.flow === 'add_credits') {
            if (pending.step === 'ask_amount') {
                const amount = parseInt(text, 10);
                if (!(amount > 0)) return bot.sendMessage(chatId, 'Please send a positive integer amount.');
                pending.tmp.amount = amount;
                pending.step = 'ask_user';
                return bot.sendMessage(chatId, 'Send the Telegram ID of the user to receive the credits.');
            }
            if (pending.step === 'ask_user') {
                const targetId = text.replace(/\D/g, '');
                if (!targetId) return bot.sendMessage(chatId, 'Invalid ID. Try again.');
                const user = getUserData(targetId);
                const newCredits = (user.credits || 0) + pending.tmp.amount;
                updateUserData(targetId, { credits: newCredits });
                await __logAdmin('ADD_CREDITS', `target=${targetId} amount=${pending.tmp.amount}`);
                await bot.sendMessage(chatId, `✅ Added ${pending.tmp.amount} credits to ${targetId}. New balance: ${newCredits}`);
                // Notify user
                try { await bot.sendMessage(parseInt(targetId, 10), `🎁 Admin added ${pending.tmp.amount} credits to your account. Your new balance is ${newCredits}.`); } catch(e){}
                await finish();
                return;
            }
        }

        if (pending.flow === 'add_subs') {
            if (pending.step === 'ask_months') {
                const months = parseInt(text, 10);
                if (!(months > 0)) return bot.sendMessage(chatId, 'Please send a positive integer for months.');
                pending.tmp.months = months;
                pending.step = 'ask_user';
                return bot.sendMessage(chatId, 'Send the Telegram ID of the user to receive the subscription.');
            }
            if (pending.step === 'ask_user') {
                const targetId = text.replace(/\D/g, '');
                if (!targetId) return bot.sendMessage(chatId, 'Invalid ID. Try again.');
                const user = getUserData(targetId);
                const now = Date.now();
                const monthMs = 30 * 24 * 60 * 60 * 1000;
                const base = (user.subscriptionExpiry && user.subscriptionExpiry > now) ? user.subscriptionExpiry : now;
                const newExpiry = base + (pending.tmp.months * monthMs);
                updateUserData(targetId, { isSubscribed: true, subscriptionExpiry: newExpiry });
                await __logAdmin('ADD_SUBS', `target=${targetId} months=${pending.tmp.months}`);
                await bot.sendMessage(chatId, `✅ Added ${pending.tmp.months} month(s) to ${targetId}. New expiry: ${new Date(newExpiry).toISOString()}`);
                // Notify user
                try { await bot.sendMessage(parseInt(targetId, 10), `🎁 Admin added a subscription for ${pending.tmp.months} month(s). Expires: ${new Date(newExpiry).toUTCString()}`); } catch(e){}
                await finish();
                return;
            }
        }
    } catch (e) {
        console.error('Admin flow error:', e.message);
        await bot.sendMessage(chatId, `Error: ${e.message}`);
        await finish();
    }
});

// Command handlers
bot.onText(/\/start/, async (msg) => {
    const user = getUserData(msg.from.id);
    const newChatId = generateFreshConversationId(user.aiUserId);
    updateUserData(msg.from.id, { currentChatId: newChatId });
    
    const welcomeMessage = `🔥 *Welcome to Lucia's World!*

${LUCIA_PERSONA.description}

*What would you like to do?*`;

    await bot.sendMessage(msg.chat.id, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: getMainMenuKeyboard()
    });
});

bot.onText(/\/status/, async (msg) => {
    const user = getUserData(msg.from.id);
    const now = Date.now();
    
    let statusMessage = `📊 *Your Account Status*\n\n`;
    
    if (user.isUnlimited) {
        statusMessage += `👑 *Status:* Rich VIP (Unlimited)\n💎 *Credits:* Unlimited\n💬 *Messages:* Unlimited`;
    } else if (user.isSubscribed && user.subscriptionExpiry && now < user.subscriptionExpiry) {
        const daysLeft = Math.ceil((user.subscriptionExpiry - now) / (24 * 60 * 60 * 1000));
        statusMessage += `🔄 *Subscription:* Active\n📅 *Days remaining:* ${daysLeft}\n💬 *Messages:* Unlimited`;
    } else {
        statusMessage += `💎 *Credits:* ${user.credits}\n`;
        statusMessage += `🆓 *Free messages used:* ${user.messageCount}/${FREE_MESSAGES_LIMIT}\n`;
        statusMessage += `💬 *Messages remaining:* ${Math.max(0, FREE_MESSAGES_LIMIT - user.messageCount + user.credits)}`;
    }
    
    statusMessage += `\n\n💰 *Total spent:* ${user.totalSpent.toFixed(2)}`;
    
    await bot.sendMessage(msg.chat.id, statusMessage, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] }
    });
});

bot.onText(/\/admin_stats/, async (msg) => {
    if (!isAdmin(msg.from.id)) {
        await bot.sendMessage(msg.chat.id, '🚫 Access denied. Admin only.');
        return;
    }
    
    const totalUsers = userDatabase.size;
    const totalCredits = Array.from(userDatabase.values()).reduce((sum, user) => sum + (user.isUnlimited ? Infinity : user.credits), 0);
    const totalSpent = Array.from(userDatabase.values()).reduce((sum, user) => sum + user.totalSpent, 0);
    
    const statsMessage = `📈 *Admin Statistics*

👥 Total Users: ${totalUsers}
💎 Total Credits: ${isFinite(totalCredits) ? totalCredits : 'Unlimited'}
💰 Total Spent: ${totalSpent.toFixed(2)}
📜 Recent Payments:
${Array.from(userDatabase.values())
    .flatMap(user => user.paymentHistory)
    .slice(-5)
    .map(p => `- ${p.type} ${p.package || ''}: ${p.amount} (${new Date(p.date).toLocaleDateString()})`).join('\n') || 'None'}`;

    await bot.sendMessage(msg.chat.id, statsMessage, { parse_mode: 'Markdown' });
});

// Callback query handlers
bot.on('callback_query', async (query) => {
    const telegramUserId = query.from.id;
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    
    try {
        if (data === 'main_menu') {
            const welcomeMessage = `🔥 *Lucia's World - Main Menu*

${LUCIA_PERSONA.description}

*What would you like to do?*`;

            await bot.editMessageText(welcomeMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: getMainMenuKeyboard()
            });
            
        } else if (data === 'start_chat') {
            const user = getUserData(telegramUserId);
            const newChatId = generateFreshConversationId(user.aiUserId);
            updateUserData(telegramUserId, { currentChatId: newChatId });
            
            await bot.editMessageText(
                `💬 *Hey there, I'm Lucia! 😈*\n\nReady to dive into some steamy fantasies? Send me a message, and let's get wild! 💦`,
                {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] }
                }
            );
            
        } else if (data === 'check_status') {
            const user = getUserData(telegramUserId);
            const now = Date.now();
            
            let statusMessage = `📊 *Your Account Status*\n\n`;
            
            if (user.isUnlimited) {
                statusMessage += `👑 *Status:* Rich VIP (Unlimited)\n💎 *Credits:* Unlimited\n💬 *Messages:* Unlimited`;
            } else if (user.isSubscribed && user.subscriptionExpiry && now < user.subscriptionExpiry) {
                const daysLeft = Math.ceil((user.subscriptionExpiry - now) / (24 * 60 * 60 * 1000));
                statusMessage += `🔄 *Subscription:* Active\n📅 *Days remaining:* ${daysLeft}\n💬 *Messages:* Unlimited`;
            } else {
                statusMessage += `💎 *Credits:* ${user.credits}\n`;
                statusMessage += `🆓 *Free messages used:* ${user.messageCount}/${FREE_MESSAGES_LIMIT}\n`;
                statusMessage += `💬 *Messages remaining:* ${Math.max(0, FREE_MESSAGES_LIMIT - user.messageCount + user.credits)}`;
            }
            
            statusMessage += `\n\n💰 *Total spent:* ${user.totalSpent.toFixed(2)}`;
            
            await bot.editMessageText(statusMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] }
            });
            
        } else if (data === 'buy_credits') {
            const creditsMessage = `💎 *Credit Packages*

Choose your package:

🥉 **Basic VIP** - ${CREDIT_PACKAGES.basic.price}
   • ${CREDIT_PACKAGES.basic.credits} credits

🥈 **Premium VIP** - ${CREDIT_PACKAGES.premium.price}
   • ${CREDIT_PACKAGES.premium.credits} credits (${CREDIT_PACKAGES.premium.credits - 30} bonus!)

🥇 **Elite VIP** - ${CREDIT_PACKAGES.elite.price}
   • ${CREDIT_PACKAGES.elite.credits} credits

👑 **Rich VIP** - ${CREDIT_PACKAGES.rich.price}
   • Unlimited credits forever!`;

            await bot.editMessageText(creditsMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: getCreditPackagesKeyboard()
            });
            
        } else if (data === 'subscribe') {
            const subscribeMessage = `🔄 *Monthly Subscription*

💰 **Price:** ${SUBSCRIPTION_PRICE}/month
✨ **Benefits:**
• Unlimited AI conversations
• No daily limits
• Priority support
• Fresh conversations each time

Choose your payment method:`;

            await bot.editMessageText(subscribeMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: getCurrencyKeyboard('subscription')
            });
            
        } else if (data === 'support') {
            const supportMessage = `🆘 *Support Options*

Need help or have questions? Here's how to reach us:

📢 Join our official channel: [Lucia's World](https://t.me/Luciadorres)
👤 Contact admin directly: @Luciadorres91

We'll respond as soon as possible! 💖`;

            await bot.editMessageText(supportMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] }
            });
            
        } else if (data.startsWith('credits_')) {
            const packageKey = data.replace('credits_', '');
            const pkg = CREDIT_PACKAGES[packageKey];
            
            const packageMessage = `💎 *${pkg.name}*

💰 **Price:** ${pkg.price}
✨ **Credits:** ${pkg.credits === -1 ? 'Unlimited' : pkg.credits}

Choose your payment method:`;

            await bot.editMessageText(packageMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: getCurrencyKeyboard('credits', packageKey)
            });
            
        } else if (data.startsWith('pay_')) {
            const parts = data.split('_');
            const type = parts[1];
            const packageKey = parts[2] !== 'sub' ? parts[2] : null;
            const currency = parts[3];
            
            // Check if user needs subscription for credit packages
            if (type === 'credits') {
                const user = getUserData(telegramUserId);
                if (!user.isSubscribed || (user.subscriptionExpiry && Date.now() > user.subscriptionExpiry)) {
                    await bot.editMessageText('🔒 *Subscription Required*\n\nYou need an active subscription to purchase credit packages.\n\nPlease subscribe first!', {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'Markdown',
                        reply_markup: { 
                            inline_keyboard: [
                                [{ text: '🔄 Subscribe Now', callback_data: 'subscribe' }],
                                [{ text: '🔙 Back', callback_data: 'buy_credits' }]
                            ]
                        }
                    });
                    return;
                }
            }
            
            await bot.editMessageText('💳 *Creating payment...*\n\nPlease wait...', {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown'
            });
            
            try {
                const payment = await createPayment(telegramUserId, chatId, type, packageKey, currency);
                
                const paymentMessage = `💳 *Payment Created*

💰 **Amount:** ${payment.pay_amount} ${payment.pay_currency.toUpperCase()}
📍 **Address:** \`${payment.pay_address}\`

Please send exactly **${payment.pay_amount} ${payment.pay_currency.toUpperCase()}** to the address above.

⏰ Payment expires in 24 hours
🔄 Status will be updated automatically

**Payment ID:** ${payment.payment_id}`;

                await bot.editMessageText(paymentMessage, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] }
                });
                
                setTimeout(() => checkPaymentStatus(payment.payment_id), 60000);
                
            } catch (error) {
                console.error('Payment error:', error.response?.data || error.message);
                await bot.editMessageText(
                    '❌ *Payment creation failed*\n\nPlease try a different currency or contact support.\n\nError: ' + (error.response?.data?.message || error.message),
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'Markdown',
                        reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: type === 'credits' ? 'buy_credits' : 'subscribe' }]] }
                    }
                );
            }
            
        } else if (data.startsWith('uncensor_')) {
            const messageKey = data.replace('uncensor_', '');
            const censoredData = pendingUnfcensor.get(messageKey);
            
            if (!censoredData) {
                await bot.answerCallbackQuery(query.id, 'This uncensor request has expired.');
                return;
            }
            
            const user = getUserData(telegramUserId);
            
            if (user.credits < UNCENSOR_COST && !user.isUnlimited) {
                await bot.answerCallbackQuery(query.id, `You need ${UNCENSOR_COST} credit to uncensor this message.`);
                return;
            }
            
            try {
                await bot.editMessageText('🔄 *Uncensoring message...*', {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown'
                });
                
                // Only deduct credit if we successfully get the response
                if (!user.isUnlimited) {
                    updateUserData(telegramUserId, { credits: user.credits - UNCENSOR_COST });
                }

                // Pick a random presaved message from conf.txt
                const randomResponse = confResponses[Math.floor(Math.random() * confResponses.length)] || 'Uncensored content here.';
                
                await bot.editMessageText(
                    `🔓 *Uncensored Response from Lucia:*\n\n${randomResponse}`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'Markdown'
                    }
                );
                
                await saveChatData(censoredData.chatId, telegramUserId, censoredData.originalMessage, randomResponse, true);
                pendingUnfcensor.delete(messageKey);
                
            } catch (error) {
                console.error('Uncensor error:', error);
                await bot.editMessageText(
                    '❌ Failed to uncensor message. Please try again later.',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'Markdown'
                    }
                );
            }
            
        } else if (data === 'help') {
            const helpMessage = `ℹ️ *Help & Information*

**Meet Lucia:**
${LUCIA_PERSONA.description}

**How it works:**
• Send any message to chat with Lucia
• Get ${FREE_MESSAGES_LIMIT} free messages to start
• Some spicy messages may require credits to unlock 😈
• Buy credits for extended access
• Subscribe for unlimited chatting

**Pricing:**
• Basic VIP: ${CREDIT_PACKAGES.basic.price} (${CREDIT_PACKAGES.basic.credits} credits)
• Premium VIP: ${CREDIT_PACKAGES.premium.price} (${CREDIT_PACKAGES.premium.credits} credits)
• Elite VIP: ${CREDIT_PACKAGES.elite.price} (${CREDIT_PACKAGES.elite.credits} credits)
• Rich VIP: ${CREDIT_PACKAGES.rich.price} (unlimited)
• Monthly subscription: ${SUBSCRIPTION_PRICE}/month

**Special Features:**
• Uncensor spicy responses (1 credit) 😈
• Fresh conversations each time
• No conversation history carried over

**Commands:**
• /start - Show main menu
• /status - Check your account status

Need more help? Contact support!`;

            await bot.editMessageText(helpMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] }
            });
        }
        
        await bot.answerCallbackQuery(query.id);
        
    } catch (error) {
        console.error('Callback query error:', error);
        await bot.answerCallbackQuery(query.id, 'An error occurred. Please try again.');
    }
});

// Message handler for AI conversations
bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    
    const telegramUserId = msg.from.id;
    const user = getUserData(telegramUserId);
    const chatId = user.currentChatId || generateFreshConversationId(user.aiUserId);
    
    // Skip processing if admin is in admin mode
    if (isAdmin(telegramUserId) && __adminMode.has(msg.chat.id)) {
        return;
    }
    
    try {
        const permission = canUserSendMessage(telegramUserId);
        
        if (!permission.canSend) {
            let limitMessage;
            
            if (permission.reason === 'banned') {
                limitMessage = '🚫 *Your account has been suspended.*\n\nContact support for assistance.';
            } else if (permission.reason === 'too_fast') {
                limitMessage = '⚡ *Slow down!* Please wait a moment between messages.';
            } else if (permission.reason === 'rate_limited') {
                limitMessage = '🚫 *Rate limit exceeded!*\n\nPlease wait a minute before sending more messages.';
            } else {
                limitMessage = `🚫 *No messages remaining!*

🆓 Free messages: ${user.messageCount}/${FREE_MESSAGES_LIMIT}
💎 Credits: ${user.credits}

💡 **Get more access:**
• Buy credit packages: /start
• Monthly subscription: ${SUBSCRIPTION_PRICE}`;
            }

            await bot.sendMessage(msg.chat.id, limitMessage, {
                parse_mode: 'Markdown',
                reply_to_message_id: msg.message_id,
                reply_markup: getMainMenuKeyboard()
            });
            return;
        }
        
        // Update user stats
        const updates = { lastMessageTime: Date.now(), currentChatId: chatId };
        if (permission.reason === 'free_messages') {
            updates.messageCount = user.messageCount + 1;
        }
        updateUserData(telegramUserId, updates);
        
        await bot.sendChatAction(msg.chat.id, 'typing');
        
        // Get AI response
        const aiResponse = await sendToAI(msg.text, user.aiUserId);
        
        // Check for keywords in AI response
        const isFlagged = /harmful|activities|policy|appropriate|apologize|inappropriate|engage|explicit|harm/i.test(aiResponse.response);
        
        // Save chat data
        await saveChatData(chatId, telegramUserId, msg.text, aiResponse.response, isFlagged);
        
        if (isFlagged && !user.isUnlimited) {
            const messageKey = `${telegramUserId}_${Date.now()}`;
            
            pendingUnfcensor.set(messageKey, {
                originalMessage: msg.text,
                aiUserId: user.aiUserId,
                telegramUserId: telegramUserId,
                chatId: chatId
            });
            
            setTimeout(() => {
                pendingUnfcensor.delete(messageKey);
            }, 10 * 60 * 1000);
            
            const censorMessage = `🔞 *This content requires credits to view* 😈\n\n💎 Your balance: ${user.isUnlimited ? '∞' : user.credits} credits\n\n🔓 Pay ${UNCENSOR_COST} credit to view the response`;

            await bot.sendMessage(msg.chat.id, censorMessage, {
                parse_mode: 'Markdown',
                reply_to_message_id: msg.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: `🔓 Unlock (${UNCENSOR_COST} Credit)`, callback_data: `uncensor_${messageKey}` }],
                        [{ text: '💎 Buy More Credits', callback_data: 'buy_credits' }]
                    ]
                }
            });
        } else {
            // Send normal response if not flagged or user has unlimited
            await bot.sendMessage(msg.chat.id, `😈 *Lucia:* ${aiResponse.response}`, {
                parse_mode: 'Markdown',
                reply_to_message_id: msg.message_id
            });
        }
        
        // Show remaining balance warning
        const updatedUser = getUserData(telegramUserId);
        if (permission.reason === 'free_messages') {
            const remaining = FREE_MESSAGES_LIMIT - updatedUser.messageCount;
            if (remaining <= 3 && remaining > 0) {
                const warningMessage = `⚠️ **${remaining} free messages remaining**\n\nConsider getting credits or subscribing for unlimited access!`;
                setTimeout(async () => {
                    await bot.sendMessage(msg.chat.id, warningMessage, {
                        parse_mode: 'Markdown',
                        reply_markup: getMainMenuKeyboard()
                    });
                }, 1000);
            }
        } else if (updatedUser.credits <= 3 && updatedUser.credits > 0) {
            const warningMessage = `⚠️ **${updatedUser.credits} credits remaining**\n\nConsider buying more credits!`;
            setTimeout(async () => {
                await bot.sendMessage(msg.chat.id, warningMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: [[{ text: '💎 Buy Credits', callback_data: 'buy_credits' }]] }
                });
            }, 1000);
        }
        
        console.log(`Successfully handled message from user ${telegramUserId} (AI ID: ${user.aiUserId}, Chat ID: ${chatId})`);
        
    } catch (error) {
        console.error(`Error handling message from user ${telegramUserId}:`, error.message);
        await bot.sendMessage(msg.chat.id, 
            '❌ Sorry, I encountered an error while processing your message. Please try again.',
            { reply_to_message_id: msg.message_id }
        );
    }
});

// Error handling
bot.on('error', (error) => {
    console.error('Telegram bot error:', error);
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down bot...');
    await saveDatabase();
    bot.stopPolling();
    process.exit(0);
});

// Start the bot
initialize().then(() => {
    console.log('🚀 Enhanced Telegram AI Bot (Lucia) started successfully!');
    console.log(`💎 Credit packages available: ${Object.keys(CREDIT_PACKAGES).length}`);
    console.log(`🔄 Subscription price: ${SUBSCRIPTION_PRICE}/month`);
    console.log(`🆓 Free messages per user: ${FREE_MESSAGES_LIMIT}`);
    console.log(`👑 Admin user ID: ${ADMIN_USER_ID}`);
});

// Auto-save database every 5 minutes
setInterval(saveDatabase, 5 * 60 * 1000);

module.exports = { 
    bot, 
    getUserData, 
    updateUserData,
    canUserSendMessage, 
    createPayment,
    checkPaymentStatus,
    isAdmin
};
