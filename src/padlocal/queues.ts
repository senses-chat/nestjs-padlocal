import { RegisterQueueOptions } from '@nestjs/bullmq';

export const ACTIONS = 'actions';
export const KICK_OUT = 'kick-out';
export const LOGIN_QR_CODE = 'login-qr-code';
export const LOGIN_START = 'login-start';
export const LOGIN_SUCCESS = 'login-success';
export const NEW_FRIEND_REQUEST = 'new-friend-request';
export const FRIEND_REQUEST = 'friend-request';
export const NEW_MESSAGE = 'new-message';
export const NEW_RAW_MESSAGE = 'new-raw-message';
export const IMAGE_MESSAGE = 'image-message';
export const VOICE_MESSAGE = 'voice-message';
export const FILE_MESSAGE = 'file-message';
export const SYNC_CONTACT = 'sync-contact';

const streams: RegisterQueueOptions['streams'] = {
  events: {
    maxLen: 100,
  },
};

const defaultJobOptions: RegisterQueueOptions['defaultJobOptions'] = {
  removeOnComplete: true,
  removeOnFail: false,
  attempts: 10,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

export const ACTIONS_OPTIONS: RegisterQueueOptions = {
  name: ACTIONS,
  streams,
  defaultJobOptions,
};

export const KICK_OUT_OPTIONS: RegisterQueueOptions = {
  name: KICK_OUT,
  streams,
  defaultJobOptions,
};

export const LOGIN_QR_CODE_OPTIONS: RegisterQueueOptions = {
  name: LOGIN_QR_CODE,
  streams,
  defaultJobOptions,
};

export const LOGIN_START_OPTIONS: RegisterQueueOptions = {
  name: LOGIN_START,
  streams,
  defaultJobOptions,
};

export const LOGIN_SUCCESS_OPTIONS: RegisterQueueOptions = {
  name: LOGIN_SUCCESS,
  streams,
  defaultJobOptions,
};

export const NEW_FRIEND_REQUEST_OPTIONS: RegisterQueueOptions = {
  name: NEW_FRIEND_REQUEST,
  streams,
  defaultJobOptions,
};

export const FRIEND_REQUEST_OPTIONS: RegisterQueueOptions = {
  name: FRIEND_REQUEST,
  streams,
  defaultJobOptions,
};

export const NEW_MESSAGE_OPTIONS: RegisterQueueOptions = {
  name: NEW_MESSAGE,
  streams,
  defaultJobOptions,
};

export const NEW_RAW_MESSAGE_OPTIONS: RegisterQueueOptions = {
  name: NEW_RAW_MESSAGE,
  streams,
  defaultJobOptions,
};

export const IMAGE_MESSAGE_OPTIONS: RegisterQueueOptions = {
  name: IMAGE_MESSAGE,
  streams,
  defaultJobOptions,
};

export const VOICE_MESSAGE_OPTIONS: RegisterQueueOptions = {
  name: VOICE_MESSAGE,
  streams,
  defaultJobOptions,
};

export const FILE_MESSAGE_OPTIONS: RegisterQueueOptions = {
  name: FILE_MESSAGE,
  streams,
  defaultJobOptions,
};

export const SYNC_CONTACT_OPTIONS: RegisterQueueOptions = {
  name: SYNC_CONTACT,
  streams,
  defaultJobOptions,
};
