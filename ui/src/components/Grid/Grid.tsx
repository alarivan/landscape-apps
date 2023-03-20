import { uniq, take, remove } from 'lodash';
import { ChargeWithDesk, useCharges } from '@/state/docket';
import { SettingsState, useSettingsState } from '@/state/settings';
import React, { useEffect, useState } from 'react';
import create from 'zustand';
import produce from 'immer';
import { useEventListener } from 'usehooks-ts';
import { useLocation, useNavigate } from 'react-router';
import useLeap from '@/components/Leap/useLeap';
import Dialog, { DialogContent } from '../Dialog';
// eslint-disable-next-line import/no-cycle
import Tile from './Tile';

export const selTiles = (s: SettingsState) => ({
  order: s.tiles.order,
  loaded: s.loaded,
});

export const dragTypes = {
  TILE: 'tile',
};

export interface TileData {
  desk: string;
  charge: ChargeWithDesk;
  position: number;
  dragging: boolean;
}

export interface RecentsStore {
  recentApps: string[];
  recentDevs: string[];
  addRecentApp: (desk: string) => void;
  addRecentDev: (ship: string) => void;
  removeRecentApp: (desk: string) => void;
}

export const useRecentsStore = create<RecentsStore>((set) => ({
  recentApps: [],
  recentDevs: [],
  addRecentApp: (desk: string) => {
    set(
      produce((draft: RecentsStore) => {
        const hasApp = draft.recentApps.find((testDesk) => testDesk === desk);
        if (!hasApp) {
          draft.recentApps.unshift(desk);
        }

        draft.recentApps = take(draft.recentApps, 3);
      })
    );
  },
  addRecentDev: (dev) => {
    set(
      produce((draft: RecentsStore) => {
        const hasDev = draft.recentDevs.includes(dev);
        if (!hasDev) {
          draft.recentDevs.unshift(dev);
        }

        draft.recentDevs = take(draft.recentDevs, 3);
      })
    );
  },
  removeRecentApp: (desk: string) => {
    set(
      produce((draft: RecentsStore) => {
        remove(draft.recentApps, (test) => test === desk);
      })
    );
  },
}));

window.recents = useRecentsStore.getState;

export function addRecentDev(dev: string) {
  return useRecentsStore.getState().addRecentDev(dev);
}

export function addRecentApp(app: string) {
  return useRecentsStore.getState().addRecentApp(app);
}

export default function Grid() {
  const navigate = useNavigate();
  const location = useLocation();
  const charges = useCharges();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setIsOpen: setLeapIsOpen } = useLeap();
  const { order, loaded } = useSettingsState(selTiles);
  const chargesLoaded = Object.keys(charges).length > 0;
  const tilesToDisplay = order.filter(
    (t) => t !== 'landscape' && t !== window.desk
  );
  const totalTiles = tilesToDisplay.length;
  const gridRef = React.useRef<HTMLDivElement>(null);
  const gridWidth = gridRef.current?.clientWidth || 0;
  const numCols = Math.floor(gridWidth / 200);

  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setLeapIsOpen(true);
      navigate(location.state.backgroundLocation);
    }
    if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'Tab') {
      e.preventDefault();
      if (selectedIndex > totalTiles - 1) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex((index) => index + 1);
      }
    }
    if (e.key === 'ArrowLeft' || e.key === 'h') {
      e.preventDefault();
      if (selectedIndex < 1) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex((index) => index - 1);
      }
    }
    if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      if (selectedIndex < 1) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex((index) => index - numCols);
      }
    }
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      if (selectedIndex > totalTiles - 1 - numCols) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex((index) => index + numCols);
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(`/app/${tilesToDisplay[selectedIndex]}`, {
        state: { backgroundLocation: location.state.backgroundLocation },
      });
    }
  });

  useEffect(() => {
    const hasKeys = order && !!order.length;
    const chargeKeys = Object.keys(charges);
    const hasChargeKeys = chargeKeys.length > 0;

    if (!loaded) {
      return;
    }

    // Correct order state, fill if none, remove duplicates, and remove
    // old uninstalled app keys
    if (!hasKeys && hasChargeKeys) {
      useSettingsState.getState().putEntry('tiles', 'order', chargeKeys);
    } else if (order.length < chargeKeys.length) {
      useSettingsState
        .getState()
        .putEntry('tiles', 'order', uniq(order.concat(chargeKeys)));
    } else if (order.length > chargeKeys.length && hasChargeKeys) {
      useSettingsState
        .getState()
        .putEntry(
          'tiles',
          'order',
          uniq(order.filter((key) => key in charges).concat(chargeKeys))
        );
    }
  }, [charges, order, loaded]);

  if (!chargesLoaded) {
    return <span>Loading...</span>;
  }

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setLeapIsOpen(true);
      navigate(-1);
    }
  };

  return (
    <Dialog defaultOpen modal onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-y-auto bg-transparent"
        containerClass="w-full"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div
          ref={gridRef}
          className="grid h-fit w-full max-w-6xl grid-cols-2 justify-center gap-4 px-4 sm:grid-cols-[repeat(auto-fit,minmax(auto,200px))] md:px-8"
        >
          {tilesToDisplay.map((desk, index) => (
            <Tile
              key={desk}
              index={index}
              selectedIndex={selectedIndex}
              charge={charges[desk]}
              desk={desk}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
