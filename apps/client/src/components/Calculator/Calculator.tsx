'use client';
import React, { useEffect, useRef, useState } from 'react';
import { calculateVentilation } from './calculations';
import { MultiStepLoader as Loader } from '../ui/multi-step-loader';
import { GoInfo } from 'react-icons/go';

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import LabelInputContainer from '../ui/label-input-container';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface InfoDetailItem {
  id: string;
  info?: string;
  additionalInfo?: string;
  describtion?: string;
  span1?: string;
  DamperFunctions?: string;
  goal?: string;
  conclusion?: string;
  withoutDamperFunctions?: string;
}

function Calculator() {
  const [kitchen, setKitchen] = useState<number | null>(null);
  const [toilet, setToilet] = useState<number | null>();
  const [shaxta, setShaxta] = useState<number | null>(null);
  const [kitchenEType, setKitchenEType] = useState<string>('hudze');
  const [damper, setDamper] = useState<string>('no');
  const [shaftVentT, setShaftVentT] = useState<string>('mechanical');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    result: number | null;
  } | null>(null);

  const [info, setInfo] = useState<string | null>(null);

  const infoRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const lan = pathname.split('/')[1];

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (infoRef.current && infoRef.current.contains(event.target as Node)) {
      } else {
        setInfo(null);
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [infoRef]);

  const t = useTranslations('calculator');

  const infoDetail: InfoDetailItem[] = [
    {
      id: 'kitchen',
      info: t('kitchen.info'),
    },
    {
      id: 'toilet',
      info: t('toilet.info'),
    },
    {
      id: 'shaxta',
      info: t('shaxta.info'),
    },
    {
      id: 'kitchenEType',
      info: t('kitchenEType.info'),
      additionalInfo: t('kitchenEType.additionalInfo'),
      span1: t('kitchenEType.span1'),
    },
    {
      id: 'damper',
      additionalInfo: t('damper.additionalInfo'),
      describtion: t('damper.describtion'),
      span1: t('damper.span1'),
      DamperFunctions: t('damper.DamperFunctions'),
      withoutDamperFunctions: t('damper.WithoutDamperFunctions'),
      goal: t('damper.goal'),
      conclusion: t('damper.conclusion'),
    },
    {
      id: 'shaftVentT',
      additionalInfo: t('shaftVentT.additionalInfo'),
      describtion: t('shaftVentT.describtion'),
    },
  ];
  const loadingStates = [
    { text: `kitchen: ${kitchen} ` },
    { text: `toilet: ${toilet} ` },
    { text: `kitchenEType: ${kitchenEType} ` },
    { text: `shaxta: ${shaxta} ` },
    { text: `damper: ${damper} ` },
    { text: `shaftVentT: ${shaftVentT} ` },
  ];

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (
      toilet === null ||
      toilet === undefined ||
      kitchen === null ||
      kitchen === undefined ||
      shaxta === null ||
      shaxta === undefined
    )
      return;

    calculateResults();
  };

  const calculateResults = () => {
    setLoading(true);

    setResults(
      calculateVentilation(
        kitchen!,
        toilet!,
        shaxta!,
        kitchenEType!,
        damper!,
        shaftVentT!
      )
    );

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <section className=' 2xl:mx-auto mx-auto w-full  p-4 '>
      <div className=' w-full flex justify-between  items-center lg:items-start flex-col  lg:flex-row'>
        <form
          onSubmit={handleSubmit}
          className='space-y-4 max-w-[600px]  w-full  bg-[#18181B] p-10'
        >
          <LabelInputContainer>
            <Label
              htmlFor='kitchen'
              className='flex justify-between text-sm items-center relative'
            >
              {t('kitchen.title')}
              <span
                className='cursor-pointer '
                onClick={() =>
                  setInfo((prev) => (prev === 'kitchen' ? null : 'kitchen'))
                }
                ref={infoRef}
              >
                {' '}
                <GoInfo />
              </span>
              {info === 'kitchen' && (
                <div className='absolute -bottom-12 -right-[10%] px-2 py-3 font-300 text-xs bg-[#3b82f6]  rounded-lg w-[100%] border '>
                  {infoDetail[0].info}
                </div>
              )}
            </Label>

            <Input
              id='kitchen'
              type='number'
              className='noS'
              required
              value={kitchen !== null && kitchen !== undefined ? kitchen : ''}
              onChange={(e) =>
                setKitchen(
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label
              htmlFor='toilet'
              className='flex justify-between  text-sm items-center relative'
            >
              {t('toilet.title')}
              <span
                className='cursor-pointer '
                onClick={() =>
                  setInfo((prev) => (prev === 'toilet' ? null : 'toilet'))
                }
              >
                {' '}
                <GoInfo />
              </span>
              {info === 'toilet' && (
                <div className='absolute -bottom-12 -right-[10%] px-2 py-3 font-300 text-xs bg-[#3b82f6]  rounded-lg w-[100%] border '>
                  {infoDetail[1].info}
                </div>
              )}
            </Label>
            <Input
              id='toilet'
              type='number'
              required
              value={toilet !== null && toilet !== undefined ? toilet : ''}
              onChange={(e) =>
                setToilet(e.target.value === '' ? null : Number(e.target.value))
              }
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label
              htmlFor='shaxta'
              className='flex justify-between  text-sm items-center relative'
            >
              {t('shaxta.title')}
              <span
                className='cursor-pointer '
                onClick={() =>
                  setInfo((prev) => (prev === 'shaxta' ? null : 'shaxta'))
                }
              >
                {' '}
                <GoInfo />
              </span>
              {info === 'shaxta' && (
                <div className='absolute -bottom-12 -right-[10%] px-2 py-3 font-300 text-[10px] bg-[#3b82f6]  rounded-lg w-[100%] border '>
                  {infoDetail[2].info}
                </div>
              )}
            </Label>
            <Input
              className='text-white'
              id='shaxta'
              type='number'
              min={200}
              value={shaxta || ''}
              onChange={(e) => {
                setShaxta(Number(e.target.value));
                setResults(null);
              }}
              required
            />
          </LabelInputContainer>

          <div className='flex md:flex-row flex-col gap-2 items-center  justify-center'>
            <LabelInputContainer>
              <Select
                required
                value={kitchenEType}
                onValueChange={setKitchenEType}
              >
                <Label
                  htmlFor='kitchenEType'
                  className='flex justify-between text-sm items-center relative'
                >
                  {t('kitchenEType.title')}
                  <span
                    className='cursor-pointer '
                    onClick={() =>
                      setInfo((prev) =>
                        prev === 'kitchenEType' ? null : 'kitchenEType'
                      )
                    }
                  >
                    {' '}
                    <GoInfo />
                  </span>
                </Label>
                <SelectTrigger className=' bg-[#27272A] border-[#202021] text-white w-full'>
                  <SelectValue
                    placeholder='კედელში (In wall'
                    className='color-white'
                  />
                </SelectTrigger>
                <SelectContent className='bg-[#27272A] border-[#202021] text-white'>
                  <SelectItem value='kedeli'>
                    {' '}
                    {t('kitchenEType.option1')}
                  </SelectItem>
                  <SelectItem value='hudze'>
                    {t('kitchenEType.option2')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </LabelInputContainer>

            <LabelInputContainer>
              <Select required value={damper} onValueChange={setDamper}>
                <Label
                  htmlFor='damper'
                  className='flex justify-between text-sm items-center'
                >
                  {t('damper.title')}

                  <span
                    className='cursor-pointer '
                    onClick={() =>
                      setInfo((prev) => (prev === 'damper' ? null : 'damper'))
                    }
                  >
                    {' '}
                    <GoInfo />
                  </span>
                </Label>
                <SelectTrigger className='w-full bg-[#27272A] border-[#202021] text-white'>
                  <SelectValue placeholder='Choose One' />
                </SelectTrigger>
                <SelectContent className='bg-[#27272A] border-[#202021] text-white'>
                  <SelectItem value='yes'> {t('damper.option1')}</SelectItem>
                  <SelectItem value='no'> {t('damper.option2')}</SelectItem>
                </SelectContent>
              </Select>
            </LabelInputContainer>
          </div>

          <LabelInputContainer className='w-full md:w-[50%]'>
            <Select required value={shaftVentT} onValueChange={setShaftVentT}>
              <Label
                htmlFor='shaftVentT'
                className='flex  justify-between text-sm items-center '
              >
                {t('shaftVentT.title')}
                <span
                  className='cursor-pointer '
                  onClick={() =>
                    setInfo((prev) =>
                      prev === 'shaftVentT' ? null : 'shaftVentT'
                    )
                  }
                >
                  {' '}
                  <GoInfo />
                </span>
              </Label>
              <SelectTrigger className='w-full bg-[#27272A] border-[#202021] text-white'>
                <SelectValue placeholder='Theme' />
              </SelectTrigger>
              <SelectContent className='bg-[#27272A] border-[#202021] text-white'>
                <SelectItem value='natural'>
                  {' '}
                  {t('shaftVentT.option2')}
                </SelectItem>
                <SelectItem value='mechanical'>
                  {t('shaftVentT.option1')}
                </SelectItem>
              </SelectContent>
            </Select>
          </LabelInputContainer>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors'
          >
            {t('Btn')}
          </button>
        </form>

        <div className='absolute top-0 left-0'>
          <Loader
            loadingStates={loadingStates}
            loading={loading}
            duration={500}
          />
        </div>

        <div className=' max-w-lg xl:max-w-xl min-h-2 pb-4 overflow-hidden lg:-order-1 text-white relative w-full'>
          {info === 'damper' && (
            <div className=' px-2 py-3 font-300 text-xs bg-[#3b82f6] w-full rounded-lg  border '>
              <div className='relative aspect-video '>
                <Image
                  src={lan.includes('ka') ? '/damperKA.png' : '/damperEn.png'}
                  className='object-contain'
                  fill
                  alt='damper Info'
                />
              </div>
              <p className='mb-4'> {infoDetail[4].additionalInfo}</p>
              <p className='mb-4'>{infoDetail[4].describtion}</p>
              <p className='mb-4'>{infoDetail[4].span1}</p>
              <p className='mb-4'>{infoDetail[4].DamperFunctions}</p>
              <p className='mb-4'>{infoDetail[4].withoutDamperFunctions}</p>
              <p className='mb-4'> {infoDetail[4].goal}</p>
              <p className=''> {infoDetail[4].conclusion}</p>
            </div>
          )}
          {info === 'kitchenEType' && (
            <div className=' px-2 py-3 font-300 text-xs bg-[#3b82f6] w-full rounded-lg  border '>
              <p className='mb-4'> {infoDetail[3].info}</p>
              <p className='mb-4'>{infoDetail[3].additionalInfo}</p>
              <div className='relative aspect-video max-w-[70%]'>
                <Image
                  src={'/kitchenhood.avif'}
                  alt='kitchen with hood'
                  fill
                  className='object-contain'
                />
              </div>
              <p className='my-4'>{infoDetail[3].span1}</p>
              <div className='relative aspect-video max-w-[70%]'>
                <Image
                  src={'/kitchenwithouthood.jpg'}
                  alt='kitchen with hood'
                  className='object-contain'
                  fill
                />
              </div>
            </div>
          )}
          {info === 'shaftVentT' && (
            <div className='left-0 top-0 px-2 py-3 font-300 text-xs bg-[#3b82f6] w-full rounded-lg  border '>
              <p className='mb-4'>{infoDetail[5].additionalInfo}</p>
              <p>{infoDetail[5].describtion}</p>

              <p></p>
            </div>
          )}

          {results &&
            !loading &&
            (results.result ? (
              <div>
                <div className='flex flex-col gap-2'>
                  <div className='flex gap-2 justify-center'>
                    <div className='flex flex-col gap-2'>
                      <div>
                        {shaxta} {t('mm')}
                      </div>

                      <div
                        className='flex gap-2 '
                        style={{
                          width: `200px`,
                          height: `${Math.min(results.result! / 4, 200)}px`,
                        }}
                      >
                        <div className='border-2 w-full h-full  border-white flex justify-center items-center mb-6'></div>
                        <p className='justify-self-center self-center text-nowrap'>
                          {results.result} {t('mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className='mt-4'>{t('ResultInfo')}</p>
              </div>
            ) : (
              <div>{t('Error')}</div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default Calculator;
