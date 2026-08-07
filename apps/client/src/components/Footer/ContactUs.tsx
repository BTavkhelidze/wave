import React, { useRef, useState } from 'react';
import LabelInputContainer from '../ui/label-input-container';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import emailjs from 'emailjs-com';

interface IFormSchema {
  name: string;
  email: string;
  message: string;
}

function ContactUs() {
  const [isBtnHover, setIsBtnHover] = useState(false);
  const refBtn = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<IFormSchema>({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<IFormSchema>>({});

  const t = useTranslations('Contact');

  const validate = () => {
    const newErrors: Partial<IFormSchema> = {};

    if (!formData.name.trim()) newErrors.name = t('errors.nameRequired');
    if (!formData.email.trim()) newErrors.email = t('errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t('errors.emailInvalid');

    if (!formData.message.trim())
      newErrors.message = t('errors.messageRequired');

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;
    emailjs
      .send(
        process.env.NEXT_PUBLIC_SERVICE_ID!,
        process.env.NEXT_PUBLIC_TEMPLATE_ID!,
        { ...formData, time: new Date().toLocaleString() },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      .then(() => {
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
      })
      .catch((error) => {
        console.error('Email error:', error);
      });
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
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          type='text'
          placeholder={t('name')}
        />
        {errors.name && (
          <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
        )}
      </LabelInputContainer>

      <LabelInputContainer className='mt-2'>
        <Label htmlFor='email'></Label>
        <Input
          id='email'
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          type='email'
          placeholder={t('Email')}
        />
        {errors.email && (
          <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
        )}
      </LabelInputContainer>

      <LabelInputContainer className='mt-2 px-[1px]'>
        <Label htmlFor='message'></Label>
        <textarea
          id='message'
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder={t('Message')}
          className='dark:placeholder-text-neutral-600 h-24 w-full rounded-md border-none px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-800 text-white shadow-[0px_0px_1px_1px_#404040] focus-visible:ring-neutral-600'
        />
        {errors.message && (
          <p className='text-red-500 text-sm mt-1'>{errors.message}</p>
        )}
      </LabelInputContainer>

      <button
        type='submit'
        className='flex cursor-pointer mt-6 gap-2 text-sm justify-self-end rounded-lg'
        onMouseEnter={() => setIsBtnHover(true)}
        onMouseLeave={() => setIsBtnHover(false)}
      >
        {t('btn')}
        <div ref={refBtn}>
          <ChevronRight />
        </div>
      </button>
    </form>
  );
}

export default ContactUs;
