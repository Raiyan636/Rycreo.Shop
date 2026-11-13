import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionGridLayoutConfig } from '../types/store';

interface ShowcaseRowMatrixProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  maxRows?: number;
  minRows?: number;
  layoutConfig?: Partial<SectionGridLayoutConfig>;
  emptyState?: React.ReactNode;
}

interface RowScrollerProps<T> {
  rowItems: T[];
  rowIndex: number;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  globalOffset: number;
  cardWidthClass: string;
}

const MOBILE_COL_CLASSES: Record<number, string> = {
  1: 'w-full',
  2: 'w-[calc((100%-0.5rem)/2)]',
  3: 'w-[calc((100%-1rem)/3)]',
};

const MOBILE_PEEK_CLASSES: Record<number, string> = {
  1: 'w-[calc(100%/1.12)]',
  2: 'w-[calc((100%-0.5rem)/2.16)]',
  3: 'w-[calc((100%-1rem)/3.16)]',
};

const TABLET_COL_CLASSES: Record<number, string> = {
  2: 'sm:w-[calc((100%-0.625rem)/2)] md:w-[calc((100%-0.625rem)/2)]',
  3: 'sm:w-[calc((100%-1.25rem)/3)] md:w-[calc((100%-1.25rem)/3)]',
  4: 'sm:w-[calc((100%-1.25rem)/3)] md:w-[calc((100%-1.875rem)/4)]',
  5: 'sm:w-[calc((100%-1.25rem)/3)] md:w-[calc((100%-1.875rem)/4)]',
  6: 'sm:w-[calc((100%-1.25rem)/3)] md:w-[calc((100%-1.875rem)/4)]',
};

const TABLET_PEEK_CLASSES: Record<number, string> = {
  2: 'sm:w-[calc((100%-0.625rem)/2.15)] md:w-[calc((100%-0.625rem)/2.15)]',
  3: 'sm:w-[calc((100%-1.25rem)/3.15)] md:w-[calc((100%-1.25rem)/3.15)]',
  4: 'sm:w-[calc((100%-1.25rem)/3.15)] md:w-[calc((100%-1.875rem)/4.18)]',
  5: 'sm:w-[calc((100%-1.25rem)/3.15)] md:w-[calc((100%-1.875rem)/4.18)]',
  6: 'sm:w-[calc((100%-1.25rem)/3.15)] md:w-[calc((100%-1.875rem)/4.18)]',
};

const DESKTOP_COL_CLASSES: Record<number, string> = {
  2: 'lg:w-[calc((100%-0.625rem)/2)]',
  3: 'lg:w-[calc((100%-1.25rem)/3)]',
  4: 'lg:w-[calc((100%-1.875rem)/4)]',
  5: 'lg:w-[calc((100%-2.5rem)/5)]',
  6: 'lg:w-[calc((100%-3.125rem)/6)]',
};

const DESKTOP_PEEK_CLASSES: Record<number, string> = {
  2: 'lg:w-[calc((100%-0.625rem)/2.16)]',
  3: 'lg:w-[calc((100%-1.25rem)/3.16)]',
  4: 'lg:w-[calc((100%-1.875rem)/4.18)]',
  5: 'lg:w-[calc((100%-2.5rem)/5.18)]',
  6: 'lg:w-[calc((100%-3.125rem)/6.18)]',
};

function ShowcaseRow<T>({
  rowItems,
  rowIndex,
  keyExtractor,
  renderItem,
  globalOffset,
  cardWidthClass,
}: RowScrollerProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 120);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, rowItems.length, cardWidthClass]);

  const scrollRow = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(220, el.clientWidth * 0.78);
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group/row" data-showcase-row={rowIndex + 1}>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollRow('left')}
          aria-label={`Scroll row ${rowIndex + 1} left`}
          className="flex absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-emerald-600 text-slate-800 hover:text-white border border-emerald-200 shadow-lg items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 sm:gap-2.5 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-1"
      >
        {rowItems.map((item, idx) => (
          <div
            key={keyExtractor(item)}
            className={`snap-start shrink-0 ${cardWidthClass} flex flex-col`}
          >
            {renderItem(item, globalOffset + idx)}
          </div>
        ))}
      </div>

      {canScrollRight && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 sm:w-8 bg-gradient-to-l from-[#ECFDF5]/80 to-transparent z-10 rounded-r-xl"
          />
          <button
            type="button"
            onClick={() => scrollRow('right')}
            aria-label={`Scroll row ${rowIndex + 1} right`}
            className="flex absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-600/95 hover:bg-emerald-700 text-white border border-white/80 shadow-lg items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </>
      )}
    </div>
  );
}

const getViewportTier = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w >= 1024) return 'desktop';
  if (w >= 640) return 'tablet';
  return 'mobile';
};

export function ShowcaseRowMatrix<T>({
  items,
  keyExtractor,
  renderItem,
  maxRows = 4,
  minRows = 1,
  layoutConfig,
  emptyState,
}: ShowcaseRowMatrixProps<T>) {
  const [viewportTier, setViewportTier] = useState<'mobile' | 'tablet' | 'desktop'>(getViewportTier);

  useEffect(() => {
    const handleResize = () => setViewportTier(getViewportTier());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!items || items.length === 0) {
    return <>{emptyState || null}</>;
  }

  const clampInt = (val: number | undefined, fallback: number, min: number, max: number) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return fallback;
    return Math.min(max, Math.max(min, Math.round(val)));
  };

  const desktopCols = clampInt(layoutConfig?.desktopColumns, 4, 2, 6);
  const mobileCols = clampInt(layoutConfig?.mobileColumns, 2, 1, 3);
  const desktopMaxRows = clampInt(layoutConfig?.maxRows, maxRows, 1, 20);
  const mobileMaxRows = clampInt(layoutConfig?.mobileMaxRows, Math.max(desktopMaxRows, 4), 1, 20);
  const maxItemsPerRow = clampInt(layoutConfig?.maxItemsPerRow, 20, 1, 50);
  const singleRowThreshold = clampInt(layoutConfig?.autoSingleRowThreshold, 3, 1, 12);

  const isMobile = viewportTier === 'mobile';
  const isTablet = viewportTier === 'tablet';

  const activeMaxRows = isMobile ? mobileMaxRows : desktopMaxRows;
  const activeCols = isMobile
    ? mobileCols
    : isTablet
    ? Math.min(desktopCols, 3)
    : desktopCols;

  // Cap items shown on homepage rows cleanly up to activeMaxRows * maxItemsPerRow
  const cappedItems = items.slice(0, activeMaxRows * maxItemsPerRow);

  // Smart beauty rule:
  // If total items fit cleanly in a single row threshold (e.g., 1-3 items or 4 items in Buy More),
  // keep all items in 1 horizontal row instead of creating an awkward sparse second row.
  let rowCount = 1;
  if (cappedItems.length > singleRowThreshold && activeMaxRows > 1) {
    const minRowThreshold = Math.min(minRows, activeMaxRows, cappedItems.length);
    const colsBasedRows = Math.ceil(cappedItems.length / activeCols);
    // For larger collections (e.g. 15 items with 3 rows => 5/row), distribute evenly across up to activeMaxRows
    const capacityBasedRows = Math.ceil(cappedItems.length / Math.max(activeCols, 4));
    rowCount = Math.min(
      activeMaxRows,
      Math.max(minRowThreshold, Math.max(colsBasedRows, capacityBasedRows), 1)
    );
    // Avoid creating a half-empty final row when fewer than activeCols items exist on desktop
    if (!isMobile && cappedItems.length <= desktopCols && minRows <= 1) {
      rowCount = 1;
    }
  }

  const rows: T[][] = Array.from({ length: rowCount }, () => []);
  cappedItems.forEach((item, index) => {
    rows[index % rowCount].push(item);
  });

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {rows.map((rowItems, rowIndex) => {
        const useMobilePeek = rowItems.length > mobileCols;
        const useDesktopPeek = rowItems.length > desktopCols;
        const mCls = useMobilePeek
          ? (MOBILE_PEEK_CLASSES[mobileCols] || MOBILE_PEEK_CLASSES[2])
          : (MOBILE_COL_CLASSES[mobileCols] || MOBILE_COL_CLASSES[2]);
        const tCls = useDesktopPeek
          ? (TABLET_PEEK_CLASSES[desktopCols] || TABLET_PEEK_CLASSES[4])
          : (TABLET_COL_CLASSES[desktopCols] || TABLET_COL_CLASSES[4]);
        const dCls = useDesktopPeek
          ? (DESKTOP_PEEK_CLASSES[desktopCols] || DESKTOP_PEEK_CLASSES[4])
          : (DESKTOP_COL_CLASSES[desktopCols] || DESKTOP_COL_CLASSES[4]);
        const rowCardWidthClass = `${mCls} ${tCls} ${dCls}`;

        return (
          <ShowcaseRow
            key={`row-${rowIndex}`}
            rowItems={rowItems}
            rowIndex={rowIndex}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            globalOffset={rowIndex}
            cardWidthClass={rowCardWidthClass}
          />
        );
      })}
    </div>
  );
}
