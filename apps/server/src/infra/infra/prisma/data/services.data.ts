// prisma/seed/services.seed.ts

import { ServiceLanguage } from 'src/api/services/enums/service-language';

export const services = [
  {
    icon: 'FaFireExtinguisher',
    iconColor: 'red',
    translations: [
      {
        language: ServiceLanguage.EN,
        title: 'Fire and Life Safety',
        description:
          'Fire and life safety systems ensure the protection of people and structural integrity during fire-related emergencies. This service includes fire risk assessment, design of fire detection, alarm, and suppression systems, smoke control and ventilation strategies, and planning efficient and safe evacuation routes.',
      },
      {
        language: ServiceLanguage.KA,
        title: 'ხანძარსაწინააღმდეგო და სიცოცხლის უსაფრთხოების სისტემები',
        description:
          'სახანძრო და სიცოცხლის უსაფრთხოების სისტემები უზრუნველყოფს ადამიანების დაცვასა და შენობების მდგრადობას ხანძართან დაკავშირებული საგანგებო სიტუაციების დროს. ეს მიმართულება მოიცავს ხანძრის რისკის შეფასებას, ხანძრის აღმომჩენის, სიგნალიზაციისა და ქრობის სისტემების პროექტირებას, კვამლის კონტროლისა და ვენტილაციის სტრატეგიებს, ასევე უსაფრთხო და ეფექტური ევაკუაციის მარშრუტების დაგეგმვას.',
      },
    ],
  },
  {
    icon: 'FaSnowflake',
    iconColor: 'blue',
    translations: [
      {
        language: ServiceLanguage.EN,
        title: 'Heating and Cooling',
        description:
          'Energy-efficient heating and cooling systems create a comfortable indoor environment while reducing energy consumption and environmental impact. Our services include designing heating, air conditioning, and ventilation systems for residential, commercial, and industrial buildings. We follow principles of high performance, sustainability, and full compliance with existing regulations.',
      },
      {
        language: ServiceLanguage.KA,
        title: 'გათბობა და გაგრილება',
        description:
          'გათბობისა და გაგრილების ენერგოეფექტური სისტემები ქმნის კომფორტულ შიდა გარემოს, ამავდროულად ამცირებს ენერგიის მოხმარებასა და გარემოზე ზემოქმედებას. მასში ერთიანდება გათბობის, კონდიცირებისა და ვენტილაციის სისტემების პროექტირება საცხოვრებელი, კომერციული და ინდუსტრიული შენობებისთვის. ჩვენი მიდგომა ეფუძნება მაღალი შედეგიანობის, მდგრადობისა და არსებულ რეგულაციებთან სრულ შესაბამისობას.',
      },
    ],
  },
  {
    icon: 'FaWind',
    iconColor: 'cyan',
    translations: [
      {
        language: ServiceLanguage.EN,
        title: 'Air Ventilation',
        description:
          'Proper ventilation systems ensure healthy indoor air quality by controlling humidity, reducing air pollutants, and maintaining continuous fresh air circulation. Our solutions incorporate both natural and mechanical ventilation strategies, designed to enhance comfort and ensure compliance with health, safety, and energy-efficiency standards.',
      },
      {
        language: ServiceLanguage.KA,
        title: 'ჰაერის ვენტილაცია',
        description:
          'შესაბამისი ვენტილაციის სისტემები უზრუნველყოფს ჯანსაღ შიდა ჰაერის ხარისხს ტენიანობის კონტროლის, ჰაერის დაბინძურების შემცირებისა და უწყვეტი სუფთა ჰაერის ცირკულაციის გზით. ჩვენი გადაწყვეტილებები მოიცავს როგორც ბუნებრივ, ასევე მექანიკურ ვენტილაციას, რომლის დანიშნულებაა კომფორტის გაუმჯობესება, ჯანმრთელობის, უსაფრთხოებისა და ენერგოეფექტურობის სტანდარტებთან შესაბამისობა.',
      },
    ],
  },
  {
    icon: 'FaFaucet',
    iconColor: 'blue',
    translations: [
      {
        language: ServiceLanguage.EN,
        title: 'Water Supply, Sewerage, and Stormwater Management',
        description:
          "Efficient plumbing systems are essential for hygiene, comfort, and sustainable water resource management in all building types. Our services include the design of internal water supply, sewage, and wastewater systems, along with optimal solutions for rainwater collection and drainage. Our solutions guarantee system reliability, compliance with regulations, and optimized water usage throughout the building's lifecycle.",
      },
      {
        language: ServiceLanguage.KA,
        title: 'წყალმომარაგება, კანალიზაცია და წვიმის წყალი',
        description:
          'ეფექტიანი სანტექნიკური სისტემები აუცილებელია ჰიგიენის, კომფორტისა და წყლის რესურსების მდგრადი მართვისთვის ყველა ტიპის შენობაში. აღნიშნული სერვისი მოიცავს შიდა წყალმომარაგების, კანალიზაციისა და ნარჩენი წყლების სისტემების პროექტირებას, ასევე წვიმის წყლის შეგროვებისა და გამოყვანის ოპტიმალურ გადაწყვეტებს. ჩვენი გადაწყვეტილებები უზრუნველყოფს სისტემის სანდოობას, ნორმებთან შესაბამისობას და წყლის მოხმარების ოპტიმიზაციას მთელი შენობის სიცოცხლის ციკლის განმავლობაში.',
      },
    ],
  },
  {
    icon: 'FaBolt',
    iconColor: 'yellow',
    translations: [
      {
        language: ServiceLanguage.EN,
        title: 'Electrical Engineering',
        description:
          'Reliable and energy-efficient electrical systems support building functionality, safety, and sustainability. Our approach integrates the design of electrical wiring networks, backup power systems, and energy-saving solutions, ensuring stable power supply and full compliance with electrical safety standards.',
      },
      {
        language: ServiceLanguage.KA,
        title: 'ელექტრო ინჟინერია',
        description:
          'საიმედო და ენერგოეფექტური ელექტრო სისტემები განაპირობებს შენობების ფუნქციურობას, უსაფრთხოებასა და მდგრადობას. მასში ინტეგრირებულია ელექტროსადენების ქსელის პროექტირება, სარეზერვო კვების სისტემებისა და ენერგიის დაზოგვის გადაწყვეტილებები, რაც გარანტიაა სტაბილური ენერგომომარაგებისა და ელექტრული უსაფრთხოების სტანდარტებთან სრული შესაბამისობისა.',
      },
    ],
  },
];
