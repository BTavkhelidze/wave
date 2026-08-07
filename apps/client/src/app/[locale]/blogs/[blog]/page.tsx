'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import * as FaIcons from 'react-icons/fa';
import { motion } from 'framer-motion';

function BlogPage() {
  const [isHover, setIsHover] = useState(false);

  const blog = {
    id: 1,
    title: 'ტექნიკური სივრცეებისა და შახტები წინასწარ განსაზღვრის მნიშვნელობა',
    sections: [
      'შენობის პროექტირებისას ხშირად მთავარი ყურადღება ექცევა არქიტექტურულ მხარესა და კონსტრუქციებს, თუმცა პრაქტიკა გვიჩვენებს, რომ საინჟინრო სივრცეების წინასწარ განსაზღვრა უდიდეს მნიშვნელობას იძენს.',
      'თუ შახტები და ტექნიკური ოთახები დაგვიანებით იგეგმება, პროექტი მშენებლობის პროცესში საჭიროებს გადაკეთებას, რაც იწვევს: დამატებით ხარჯებს, სამუშაოს გაჭიანურებას, სივრცეების გადაგეგმარებას არქიტექტურაში, კონსტრუქციის ცვლილებებს.',
      'ძირითადი ტექნიკური სივრცეები, რომლებიც წინასწარ უნდა განისაზღვროს: სახანძრო სატუმბი სადგური და რეზერვუარი საჭიროებს ცალკე სივრცის გამოყოფას 41-ე დადგენილების შესაბამისად...',
      'წყლის სატუმბი და რეზერვუარი — სასმელი წყლის ტუმბოსა და ავზის სწორი განთავსება ამცირებს ენერგომოხმარებას, აუმჯობესებს წყალმომარაგების ეფექტურობას და აადვილებს ტექნიკურ მომსახურებას.',
      'ელექტრო ოთახი — შენობის მთავარი ელექტრო სისტემა კონცენტრირებულია ერთ სივრცეში. არასაკმარისად გათვალისწინების შემთხვევაში, მომავალში კაბელების გაყვანა ან გენერატორის დამატება რთულდება.',
      'ხანძრის მართვის ცენტრი (FACP) — ცალკე, დაცული სივრცე ხანძარსაწინააღმდეგო და უსაფრთხოების სისტემების მართვისთვის...',
      'შახტები და ხვრეტები — წინასწარ გათვლილი ვერტიკალური შახტები უზრუნველყოფს საინჟინრო მაგისტრალების სწორ განთავსებას...',
      'ვენტილატორებისა და სხვა აგრეგატების განთავსება სახურავზე — ექსპლუირებადი სახურავის შემთხვევაში მნიშვნელოვანია, ადგილი წინასწარ გაითვალოს...',
      'სხვა ტექნიკური სივრცეები — მექანიკური ოთახები, ჩილერები, კონდენსატორები, AHU და ვენტილატორები უზრუნველყოფენ შენობის თერმულ კომფორტს...',
      'ორი სცენარი: დაგვიანებული დაგეგმვა VS წინასწარი დაგეგმვა — ნათლად აჩვენებს, რომ სწორი გზა არის საინჟინრო სივრცეების წინასწარი განსაზღვრა.',
      'სარგებელი: ფართის ეფექტური განაწილება, მარტივი კონსტრუქტორული სამუშაო, ხარჯებისა და დროის დაზოგვა, გამარტივებული შენობის ექსპლუატაცია.',
    ],
  };

  return (
    <div className='relative max-w-[1280px] pb-20 pt-40 text-white w-full mx-2 xl:mx-auto'>
      <Link
        href='/blogs'
        className='flex gap-2 items-center mb-6'
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <FaIcons.FaAngleLeft />
        <motion.span
          initial={{ x: 0 }}
          animate={isHover ? { x: 10 } : { x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Go Back
        </motion.span>
      </Link>

      <section className='w-full flex-1 flex flex-col items-center text-center justify-center'>
        <div
          key={blog.id}
          className='flex flex-col gap-6 max-w-[100%] w-full px-6 sm:px-10 md:px-14'
        >
          <FaIcons.FaBookOpen className='text-3xl md:text-5xl self-center mt-10 text-green-400' />

          <h1 className='text-xl sm:text-2xl md:text-4xl lg:text-3xl font-bold text-center text-white'>
            {blog.title}
          </h1>

          <div className='flex flex-col gap-4 text-sm sm:text-base text-[#898D8E] leading-7 text-justify'>
            {blog.sections.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default BlogPage;
