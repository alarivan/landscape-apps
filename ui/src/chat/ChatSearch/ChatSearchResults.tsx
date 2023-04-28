import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BigInteger } from 'big-integer';
import { useParams } from 'react-router';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useChatStore } from '@/chat/useChatStore';
import { ChatWrit } from '@/types/chat';
import { useIsMobile } from '@/logic/useMedia';
import { useChatSearch } from '@/state/chat';
import ChatScrollerPlaceholder from '../ChatScoller/ChatScrollerPlaceholder';
import ChatSearchResult from './ChatSearchResult';

interface ChatSearchResultsProps {
  whom: string;
}

function itemContent(
  _i: number,
  [whom, key, writ]: [string, BigInteger, ChatWrit]
) {
  return (
    <div className="px-4 sm:px-2">
      <ChatSearchResult whom={whom} writ={writ} time={key} />
    </div>
  );
}

export default function ChatSearchResults({ whom }: ChatSearchResultsProps) {
  const scrollerRef = useRef<VirtuosoHandle>(null);
  const { query } = useParams<{ query: string }>();
  const { scan, isLoading } = useChatSearch(whom, query || '');
  const [delayedLoading, setDelayedLoading] = useState(false);
  const reallyLoading = isLoading && query && query !== '';
  const isMobile = useIsMobile();
  const thresholds = {
    atBottomThreshold: 125,
    atTopThreshold: 125,
    overscan: isMobile
      ? { main: 200, reverse: 200 }
      : { main: 400, reverse: 400 },
  };

  const entries = useMemo(() => {
    return scan
      ? [...scan].map(
          ([int, writ]) => [whom, int, writ] as [string, BigInteger, ChatWrit]
        )
      : [];
  }, [scan, whom]);

  useEffect(() => {
    let timeout = 0;

    if (reallyLoading) {
      timeout = setTimeout(() => {
        setDelayedLoading(true);
      }, 150) as unknown as number;
    } else {
      clearTimeout(timeout);
      setDelayedLoading(false);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [reallyLoading]);

  useEffect(() => {
    useChatStore.getState().setCurrent(whom);
  }, [whom]);

  return (
    <div className="relative h-full">
      <div className="flex h-full w-full flex-col overflow-hidden">
        {delayedLoading ? (
          <div className="h-full">
            <ChatScrollerPlaceholder count={30} />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="text-xl font-semibold text-gray-600">
              No results found
            </div>
          </div>
        ) : (
          <Virtuoso
            {...thresholds}
            ref={scrollerRef}
            data={entries}
            itemContent={itemContent}
            computeItemKey={(i, item) => item[1].toString()}
            className="h-full w-full list-none overflow-x-hidden overflow-y-scroll"
          />
        )}
      </div>
    </div>
  );
}
