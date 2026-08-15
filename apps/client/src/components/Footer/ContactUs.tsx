import React, { useRef, useState } from 'react';
import LabelInputContainer from '../ui/label-input-container';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useSubmitContactMessageMutation } from './contact/contact.queries';

interface IFormSchema {
  name: string;
  email: string;
  phone: string;
  message: string;
}

function ContactUs() {
  const [isBtnHover, setIsBtnHover] = useState(false);
  const refBtn = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<IFormSchema>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<IFormSchema>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const contactMutation = useSubmitContactMessageMutation();

  const t = useTranslations('Contact');

  const validate = () => {
    const newErrors: Partial<IFormSchema> = {};

    const normalizedName = formData.name.trim();
    const normalizedEmail = formData.email.trim();
    const normalizedMessage = formData.message.trim();

    if (!normalizedName)
      newErrors.name = t('nameRequired');
    else if (normalizedName.length < 2)
      newErrors.name = t('nameShort');
    if (!normalizedEmail)
      newErrors.email = t('emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
      newErrors.email = t('emailInvalid');

    if (!normalizedMessage)
      newErrors.message = t('messageRequired');
    else if (normalizedMessage.length < 10)
      newErrors.message = t('messageShort');

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (contactMutation.isPending) return;
    if (!validate()) return;

    contactMutation.mutate(
      {
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        message: formData.message.trim(),
      },
      {
        onSuccess: () => {
          setSuccessMessage(t('success'));
          setFormData({ name: '', email: '', phone: '', message: '' });
          setErrors({});
        },
      }
    );
  };

  const submitError =
    contactMutation.error instanceof Error
      ? contactMutation.error.message || t('failure')
      : null;

  const handleFieldChange = (field: keyof IFormSchema, value: string) => {
    if (successMessage) {
      setSuccessMessage(null);
    }

    if (contactMutation.isError) {
      contactMutation.reset();
    }

    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  useGSAP(() => {
    if (refBtn.current) {
      gsap.to(refBtn.current, {
        xPercent: isBtnHover ? 55 : 0,
        duration: 0.4,
        ease: 'power1.inOut',
      });
    }
  }, [isBtnHover]);

  return (
    <form
      onSubmit={handleSubmit}
      className='w-full max-w-[500px] flex flex-col items-start'
    >
      <LabelInputContainer>
        <Label htmlFor='name'></Label>
        <Input
          id='name'
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          type='text'
          maxLength={100}
          placeholder={t('name')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id='name-error' className='text-red-500 text-sm mt-1'>
            {errors.name}
          </p>
        )}
      </LabelInputContainer>

      <LabelInputContainer className='mt-2'>
        <Label htmlFor='email'></Label>
        <Input
          id='email'
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          type='email'
          maxLength={254}
          placeholder={t('Email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id='email-error' className='text-red-500 text-sm mt-1'>
            {errors.email}
          </p>
        )}
      </LabelInputContainer>

      <LabelInputContainer className='mt-2'>
        <Label htmlFor='phone'></Label>
        <Input
          id='phone'
          value={formData.phone}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          type='tel'
          maxLength={30}
          placeholder={t('Phone')}
        />
      </LabelInputContainer>

      <LabelInputContainer className='mt-2 px-[1px]'>
        <Label htmlFor='message'></Label>
        <textarea
          id='message'
          value={formData.message}
          onChange={(e) => handleFieldChange('message', e.target.value)}
          placeholder={t('Message')}
          maxLength={5000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className='dark:placeholder-text-neutral-600 h-24 w-full rounded-md border-none px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-800 text-white shadow-[0px_0px_1px_1px_#404040] focus-visible:ring-neutral-600'
        />
        {errors.message && (
          <p id='message-error' className='text-red-500 text-sm mt-1'>
            {errors.message}
          </p>
        )}
      </LabelInputContainer>

      <button
        type='submit'
        disabled={contactMutation.isPending}
        className='flex cursor-pointer mt-6 gap-2 text-sm justify-self-end rounded-lg disabled:cursor-not-allowed disabled:opacity-60'
        onMouseEnter={() => setIsBtnHover(true)}
        onMouseLeave={() => setIsBtnHover(false)}
      >
        {contactMutation.isPending ? t('sending') : t('btn')}
        <div ref={refBtn}>
          <ChevronRight />
        </div>
      </button>
      {successMessage && (
        <p role='status' className='mt-3 text-sm text-green-500'>
          {successMessage}
        </p>
      )}
      {submitError && (
        <p role='alert' className='mt-3 text-sm text-red-500'>
          {submitError}
        </p>
      )}
    </form>
  );
}

export default ContactUs;
