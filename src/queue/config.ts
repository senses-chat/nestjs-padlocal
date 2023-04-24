const QUEUES = {
  queuesArray: [
    {
      name: 'kickout',
    },
    {
      name: 'loginQrcode',
    },
    {
      name: 'loginStart',
    },
    {
      name: 'loginSuccess',
    },
    {
      name: 'newFriendRequest',
    },
    {
      name: 'newMessage',
    },
    {
      name: 'newRawMessage',
    },
    {
      name: 'syncContact',
    },
    {
      name: 'common',
    },
  ],
  commonWorkerOptions: {
    limiter: {
      max: 1,
      duration: 2000,
    },
  },
};

export { QUEUES };
