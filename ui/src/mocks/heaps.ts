import { HeapCurios, Stash } from '@/types/heap';
import {
  Handler,
  ScryHandler,
  SubscriptionHandler,
} from '@tloncorp/mock-http-api';
import { subMinutes } from 'date-fns';

const unixTime = subMinutes(new Date(), 1).getTime();

const mockStash: Stash = {
  'heap/~zod/testHeap': {
    perms: {
      writers: ['~zod', '~finned-palmer'],
    },
  },
};

const mockCurios: HeapCurios = {
  '170141184505776467152677676749638598656': {
    seal: {
      time: unixTime,
      feels: {},
      replied: [],
    },
    heart: {
      title: 'House rendering',
      content: [
        'https://finned-palmer.s3.filebase.com/finned-palmer/2022.3.31..15.13.50-rendering1.png',
      ],
      author: '~finned-palmer',
      sent: unixTime,
      replying: null,
    },
  },
  '170141184505776467152677676749638598657': {
    seal: {
      time: unixTime,
      feels: {},
      replied: [],
    },
    heart: {
      title: 'House rendering',
      content: [
        'https://finned-palmer.s3.filebase.com/finned-palmer/2022.3.31..15.13.50-rendering1.png',
      ],
      author: '~finned-palmer',
      sent: unixTime,
      replying: null,
    },
  },
  '170141184505776467152677676749638598658': {
    seal: {
      time: unixTime,
      feels: {},
      replied: [],
    },
    heart: {
      title: 'House rendering',
      content: [
        'https://finned-palmer.s3.filebase.com/finned-palmer/2022.3.31..15.13.50-rendering1.png',
      ],
      author: '~finned-palmer',
      sent: unixTime,
      replying: null,
    },
  },
  '170141184505776467152677676749638598659': {
    seal: {
      time: unixTime,
      feels: {},
      replied: [],
    },
    heart: {
      title: 'House rendering',
      content: [
        'https://finned-palmer.s3.filebase.com/finned-palmer/2022.3.31..15.13.50-rendering1.png',
      ],
      author: '~finned-palmer',
      sent: unixTime,
      replying: null,
    },
  },
};

export const heapBriefsSub: SubscriptionHandler = {
  action: 'subscribe',
  app: 'heap',
  path: '/briefs',
};

export const heapStashScry: ScryHandler = {
  action: 'scry',
  app: 'heap',
  path: '/stash',
  func: () => mockStash,
};

export const heapBriefsScry: ScryHandler = {
  action: 'scry',
  app: 'heap',
  path: '/briefs',
  func: () => ({
    '~zod/testHeap': {
      last: unixTime,
      count: 1,
      'read-id': null,
    },
  }),
};

export const heapPermsScry: ScryHandler = {
  action: 'scry',
  app: 'heap',
  path: '/heap/~zod/testHeap/perm',
  func: () => ({
    perms: {
      writers: ['~zod', '~finned-palmer'],
    },
  }),
};

export const heapCuriosScry: ScryHandler = {
  action: 'scry',
  app: 'heap',
  path: '/heap/~zod/testHeap/curios/newest/100',
  func: () => mockCurios,
};

export const heapCuriosSubscribe: SubscriptionHandler = {
  action: 'subscribe',
  app: 'heap',
  path: '/heap/~zod/testHeap/ui/curios',
};

const heapHandlers: Handler[] = [
  heapBriefsSub,
  heapStashScry,
  heapBriefsScry,
  heapPermsScry,
  heapCuriosScry,
  heapCuriosSubscribe,
];

export default heapHandlers;