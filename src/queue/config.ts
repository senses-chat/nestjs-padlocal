const queusDefaultOptions = {
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
      ...queusDefaultOptions,
    },
    {
      name: 'loginQrcode',
      ...queusDefaultOptions,
    },
    {
      name: 'loginStart',
      ...queusDefaultOptions,
    },
    {
      name: 'loginSuccess',
      ...queusDefaultOptions,
    },
    {
      name: 'newFriendRequest',
      ...queusDefaultOptions,
    },
    {
      name: 'newMessage',
      ...queusDefaultOptions,
    },
    {
      name: 'newRawMessage',
      ...queusDefaultOptions,
    },
    {
      name: 'syncContact',
      ...queusDefaultOptions,
    },
    {
      name: 'common',
      ...queusDefaultOptions,
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
