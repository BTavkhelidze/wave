'use client';

import { useEffect } from 'react';

type PublicViewEntityType = 'blog' | 'service';

type UseRecordPublicViewInput = {
  entityType: PublicViewEntityType;
  entityId: string | undefined;
  slug: string | undefined;
  recordView: (slug: string) => Promise<void>;
};

const inFlightViewKeys = new Set<string>();

function buildSessionKey(
  entityType: PublicViewEntityType,
  entityId: string,
): string {
  return `wave:view:${entityType}:${entityId}`;
}

function isAlreadyRecorded(sessionKey: string): boolean {
  try {
    return sessionStorage.getItem(sessionKey) === '1';
  } catch {
    return false;
  }
}

function markRecorded(sessionKey: string): void {
  try {
    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // If sessionStorage is unavailable, avoid interrupting the public page.
  }
}

export function useRecordPublicView({
  entityType,
  entityId,
  slug,
  recordView,
}: UseRecordPublicViewInput): void {
  const viewKey = entityId ? buildSessionKey(entityType, entityId) : undefined;

  useEffect(() => {
    if (!viewKey || !slug) {
      return;
    }

    if (inFlightViewKeys.has(viewKey) || isAlreadyRecorded(viewKey)) {
      return;
    }

    inFlightViewKeys.add(viewKey);

    void recordView(slug)
      .then(() => {
        markRecorded(viewKey);
      })
      .catch(() => undefined)
      .finally(() => {
        inFlightViewKeys.delete(viewKey);
      });
  }, [recordView, slug, viewKey]);
}
