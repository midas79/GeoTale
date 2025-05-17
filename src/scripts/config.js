const CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  OBJECT_STORE_NAME: 'stories',
  PUSH_NOTIFICATION: {
    VAPID_PUBLIC_KEY:
      'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',
  },
  NOTIFICATION_ENDPOINTS: {
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/subscribe', // Same endpoint but using DELETE method
  },
};

export default CONFIG;
