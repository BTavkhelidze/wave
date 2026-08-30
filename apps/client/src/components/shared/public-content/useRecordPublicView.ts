'use client';

import { useEffect, useRef } from 'react';

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
  const lastAttemptedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!entityId || !slug) {
      return;
    }

    const sessionKey = buildSessionKey(entityType, entityId);

    if (
      lastAttemptedKeyRef.current === sessionKey ||
      inFlightViewKeys.has(sessionKey) ||
      isAlreadyRecorded(sessionKey)
    ) {
      return;
    }

    lastAttemptedKeyRef.current = sessionKey;
    inFlightViewKeys.add(sessionKey);

    void recordView(slug)
      .then(() => {
        markRecorded(sessionKey);
      })
      .catch(() => {
        lastAttemptedKeyRef.current = null;
      })
      .finally(() => {
        inFlightViewKeys.delete(sessionKey);
      });
  }, [entityId, entityType, recordView, slug]);
}
