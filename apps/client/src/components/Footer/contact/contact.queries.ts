'use client';

import { useMutation } from '@tanstack/react-query';
import {
  submitContactMessage,
  type ContactFormPayload,
  type ContactFormResponse,
} from './contact.api';

export function useSubmitContactMessageMutation() {
  return useMutation<ContactFormResponse, Error, ContactFormPayload>({
    mutationFn: submitContactMessage,
  });
}
