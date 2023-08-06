const queuesDefaultOptions = {
  defaultJobOptions: {
    attempts: 10,
    removeOnComplete: true,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
  streams: {
    events: {
      maxLen: 100,
    },
  },
};

const QUEUES = {
  queuesArray: [
    {
      name: 'kickout',
      ...queuesDefaultOptions,
    },
    {
      name: 'loginQrcode',
      ...queuesDefaultOptions,
    },
    {
      name: 'loginStart',
      ...queuesDefaultOptions,
    },
    {
      name: 'loginSuccess',
      ...queuesDefaultOptions,
    },
    {
      name: 'newFriendRequest',
      ...queuesDefaultOptions,
    },
    {
      name: 'friendRequest',
      ...queuesDefaultOptions,
    },
    {
      name: 'newMessage',
      ...queuesDefaultOptions,
    },
    {
      name: 'newRawMessage',
      ...queuesDefaultOptions,
    },
    {
      name: 'syncContact',
      ...queuesDefaultOptions,
    },
    {
      name: 'common',
      ...queuesDefaultOptions,
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
