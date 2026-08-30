import { Language } from '@prisma/client';

const defaultAnimationColors = [
  '#B22222',
  '#FF8C00',
  '#FFD700',
  '#2F4F4F',
  '#DCDCDC',
] as const;

export const services = [
  {
    sortOrder: 1,
    icon: 'FaFireExtinguisher',
    iconColor: 'red',
    animationColors: [...defaultAnimationColors],
    translations: [
      {
        language: Language.EN,
        title: 'Fire and Life Safety',
        slug: 'fire-and-life-safety',
        description:
          'Fire and life safety systems protect people and preserve structural integrity during fire-related emergencies. Our service includes fire-risk assessment, fire detection, alarm and suppression system design, smoke-control and ventilation strategies, and the planning of safe and efficient evacuation routes.',
        metaTitle: 'Fire and Life Safety Systems',
        metaDescription:
          'Fire-risk assessment and the design of fire detection, alarm, suppression, smoke-control and safe evacuation systems for modern buildings.',
      },
      {
        language: Language.KA,
        title: 'ხანძარსაწინააღმდეგო და სიცოცხლის უსაფრთხოების სისტემები',
        slug: 'fire-and-life-safety',
        description:
          'სახანძრო და სიცოცხლის უსაფრთხოების სისტემები უზრუნველყოფს ადამიანების დაცვასა და შენობების მდგრადობას ხანძართან დაკავშირებული საგანგებო სიტუაციების დროს. ეს მიმართულება მოიცავს ხანძრის რისკის შეფასებას, ხანძრის აღმოჩენის, სიგნალიზაციისა და ქრობის სისტემების პროექტირებას, კვამლის კონტროლისა და ვენტილაციის სტრატეგიებს, ასევე უსაფრთხო და ეფექტიანი ევაკუაციის მარშრუტების დაგეგმვას.',
        metaTitle: 'ხანძარსაწინააღმდეგო და სიცოცხლის უსაფრთხოების სისტემები',
        metaDescription:
          'ხანძრის რისკის შეფასება და აღმოჩენის, სიგნალიზაციის, ქრობის, კვამლის კონტროლისა და უსაფრთხო ევაკუაციის სისტემების პროექტირება.',
      },
    ],
  },
  {
    sortOrder: 2,
    icon: 'FaSnowflake',
    iconColor: 'blue',
    animationColors: ['#1E90FF', '#87CEFA', '#FF4500', '#F2F2F2', '#36454F'],
    translations: [
      {
        language: Language.EN,
        title: 'Heating and Cooling',
        slug: 'heating-and-cooling',
        description:
          'Energy-efficient heating and cooling systems create a comfortable indoor environment while reducing energy consumption and environmental impact. Our services include the design of heating, air-conditioning and ventilation systems for residential, commercial and industrial buildings. Our approach prioritizes performance, sustainability and compliance with applicable regulations.',
        metaTitle: 'Heating and Cooling System Design',
        metaDescription:
          'Energy-efficient heating, cooling, air-conditioning and ventilation system design for residential, commercial and industrial buildings.',
      },
      {
        language: Language.KA,
        title: 'გათბობა და გაგრილება',
        slug: 'heating-and-cooling',
        description:
          'გათბობისა და გაგრილების ენერგოეფექტური სისტემები ქმნის კომფორტულ შიდა გარემოს და ამავდროულად ამცირებს ენერგიის მოხმარებასა და გარემოზე ზემოქმედებას. მომსახურება მოიცავს გათბობის, კონდიცირებისა და ვენტილაციის სისტემების პროექტირებას საცხოვრებელი, კომერციული და ინდუსტრიული შენობებისთვის. ჩვენი მიდგომა ეფუძნება მაღალ შედეგიანობას, მდგრადობასა და მოქმედ რეგულაციებთან სრულ შესაბამისობას.',
        metaTitle: 'გათბობისა და გაგრილების სისტემების პროექტირება',
        metaDescription:
          'ენერგოეფექტური გათბობის, გაგრილების, კონდიცირებისა და ვენტილაციის სისტემების პროექტირება სხვადასხვა დანიშნულების შენობებისთვის.',
      },
    ],
  },
  {
    sortOrder: 3,
    icon: 'FaWind',
    iconColor: 'cyan',
    animationColors: ['#00BFFF', '#40E0D0', '#3A6073', '#E8ECEF', '#FFFFFF'],
    translations: [
      {
        language: Language.EN,
        title: 'Air Ventilation',
        slug: 'air-ventilation',
        description:
          'Proper ventilation systems ensure healthy indoor air quality by controlling humidity, reducing airborne pollutants and maintaining continuous fresh-air circulation. Our solutions incorporate natural and mechanical ventilation strategies designed to improve comfort and meet health, safety and energy-efficiency standards.',
        metaTitle: 'Air Ventilation System Design',
        metaDescription:
          'Natural and mechanical ventilation solutions that improve indoor air quality, control humidity and support energy-efficient building operation.',
      },
      {
        language: Language.KA,
        title: 'ჰაერის ვენტილაცია',
        slug: 'air-ventilation',
        description:
          'სათანადო ვენტილაციის სისტემები უზრუნველყოფს შიდა ჰაერის ჯანსაღ ხარისხს ტენიანობის კონტროლის, ჰაერის დამაბინძურებლების შემცირებისა და სუფთა ჰაერის უწყვეტი ცირკულაციის გზით. ჩვენი გადაწყვეტილებები მოიცავს ბუნებრივ და მექანიკურ ვენტილაციას, რომლის მიზანია კომფორტის გაუმჯობესება და ჯანმრთელობის, უსაფრთხოებისა და ენერგოეფექტურობის სტანდარტებთან შესაბამისობა.',
        metaTitle: 'ჰაერის ვენტილაციის სისტემების პროექტირება',
        metaDescription:
          'ბუნებრივი და მექანიკური ვენტილაციის სისტემები ჯანსაღი შიდა ჰაერის, ტენიანობის კონტროლისა და ენერგოეფექტური გარემოსთვის.',
      },
    ],
  },
  {
    sortOrder: 4,
    icon: 'FaFaucet',
    iconColor: 'blue',
    animationColors: ['#2A7AE2', '#6CA6CD', '#6B8E23', '#37474F', '#ECEFF1'],
    translations: [
      {
        language: Language.EN,
        title: 'Water Supply, Sewerage and Stormwater Management',
        slug: 'water-supply-sewerage-and-stormwater-management',
        description:
          'Efficient plumbing systems are essential for hygiene, comfort and sustainable water-resource management in every type of building. Our services include the design of internal water-supply, sewerage and wastewater systems, together with optimized rainwater collection and drainage solutions. The result is reliable operation, regulatory compliance and optimized water use throughout the building lifecycle.',
        metaTitle: 'Water Supply, Sewerage and Stormwater Systems',
        metaDescription:
          'Reliable water-supply, sewerage, wastewater and stormwater system design focused on compliance and efficient water-resource management.',
      },
      {
        language: Language.KA,
        title: 'წყალმომარაგება, კანალიზაცია და წვიმის წყლის მართვა',
        slug: 'water-supply-sewerage-and-stormwater-management',
        description:
          'ეფექტიანი სანტექნიკური სისტემები აუცილებელია ჰიგიენის, კომფორტისა და წყლის რესურსების მდგრადი მართვისთვის ყველა ტიპის შენობაში. მომსახურება მოიცავს შიდა წყალმომარაგების, კანალიზაციისა და ჩამდინარე წყლების სისტემების პროექტირებას, ასევე წვიმის წყლის შეგროვებისა და გადინების ოპტიმალურ გადაწყვეტებს. ჩვენი მიდგომა უზრუნველყოფს სისტემის საიმედოობას, ნორმებთან შესაბამისობასა და წყლის მოხმარების ოპტიმიზაციას შენობის მთელი სასიცოცხლო ციკლის განმავლობაში.',
        metaTitle: 'წყალმომარაგებისა და კანალიზაციის სისტემები',
        metaDescription:
          'წყალმომარაგების, კანალიზაციის, ჩამდინარე და წვიმის წყლის სისტემების საიმედო და რესურსეფექტური საინჟინრო პროექტირება.',
      },
    ],
  },
  {
    sortOrder: 5,
    icon: 'FaBolt',
    iconColor: 'yellow',
    animationColors: ['#FFC107', '#1976D2', '#455A64', '#212121', '#F5F5F5'],
    translations: [
      {
        language: Language.EN,
        title: 'Electrical Engineering',
        slug: 'electrical-engineering',
        description:
          'Reliable and energy-efficient electrical systems support building functionality, safety and sustainability. Our approach integrates the design of electrical distribution and wiring networks, backup-power systems and energy-saving solutions, ensuring a stable power supply and compliance with electrical safety standards.',
        metaTitle: 'Electrical Engineering and System Design',
        metaDescription:
          'Electrical distribution, wiring, backup-power and energy-saving system design for safe, stable and efficient building operation.',
      },
      {
        language: Language.KA,
        title: 'ელექტროინჟინერია',
        slug: 'electrical-engineering',
        description:
          'საიმედო და ენერგოეფექტური ელექტროსისტემები განაპირობებს შენობების ფუნქციურობას, უსაფრთხოებასა და მდგრადობას. ჩვენი მიდგომა აერთიანებს ელექტროგამანაწილებელი და სადენების ქსელების, სარეზერვო კვების სისტემებისა და ენერგიის დაზოგვის გადაწყვეტების პროექტირებას, რაც უზრუნველყოფს სტაბილურ ენერგომომარაგებასა და ელექტრული უსაფრთხოების სტანდარტებთან შესაბამისობას.',
        metaTitle: 'ელექტროსისტემების საინჟინრო პროექტირება',
        metaDescription:
          'ელექტროგამანაწილებელი ქსელების, სადენების, სარეზერვო კვებისა და ენერგოდამზოგავი სისტემების უსაფრთხო და ეფექტიანი პროექტირება.',
      },
    ],
  },
  {
    sortOrder: 6,
    icon: 'FaNetworkWired',
    iconColor: 'purple',
    animationColors: ['#673AB7', '#3F51B5', '#00ACC1', '#263238', '#ECEFF1'],
    translations: [
      {
        language: Language.EN,
        title: 'Low Voltage Systems',
        slug: 'low-voltage-systems',
        description:
          'Integrated low-voltage systems enhance security, communication and smart-building functionality. Our services include the design of security and video-surveillance systems, access control, structured cabling, audio-visual technologies and automation systems that improve building efficiency and user experience.',
        metaTitle: 'Low Voltage and Smart Building Systems',
        metaDescription:
          'Design of security, video surveillance, access control, structured cabling, audio-visual and smart-building automation systems.',
      },
      {
        language: Language.KA,
        title: 'სუსტი დენების სისტემები',
        slug: 'low-voltage-systems',
        description:
          'ინტეგრირებული სუსტი დენების სისტემები უზრუნველყოფს უსაფრთხოებას, კომუნიკაციასა და ჭკვიანი შენობების ფუნქციურობას. მომსახურება მოიცავს უსაფრთხოებისა და ვიდეომეთვალყურეობის სისტემების, წვდომის კონტროლის, სტრუქტურირებული კაბელირების, აუდიოვიზუალური ტექნოლოგიებისა და ავტომატიზაციის სისტემების პროექტირებას, რაც აუმჯობესებს შენობის ეფექტიანობასა და მომხმარებლის გამოცდილებას.',
        metaTitle: 'სუსტი დენებისა და ჭკვიანი შენობის სისტემები',
        metaDescription:
          'ვიდეომეთვალყურეობის, წვდომის კონტროლის, სტრუქტურირებული კაბელირების, აუდიოვიზუალური და ავტომატიზაციის სისტემების პროექტირება.',
      },
    ],
  },
  {
    sortOrder: 7,
    icon: 'FaLightbulb',
    iconColor: 'purple',
    animationColors: ['#FFD54F', '#FF8A65', '#81D4FA', '#37474F', '#FAFAFA'],
    translations: [
      {
        language: Language.EN,
        title: 'Lighting Engineering',
        slug: 'lighting-engineering',
        description:
          'Effective lighting design improves comfort, functionality and energy efficiency in buildings. This service integrates advanced LED technologies, daylighting strategies and smart lighting-control systems to reduce energy consumption and create visually and functionally balanced indoor environments.',
        metaTitle: 'Lighting Engineering and Smart Lighting Design',
        metaDescription:
          'Energy-efficient lighting design combining LED technology, daylight strategies and smart controls for balanced and comfortable indoor spaces.',
      },
      {
        language: Language.KA,
        title: 'განათების ინჟინერია',
        slug: 'lighting-engineering',
        description:
          'ეფექტიანი განათების პროექტი აუმჯობესებს შენობის კომფორტს, ფუნქციურობასა და ენერგოეფექტურობას. ეს მიმართულება აერთიანებს თანამედროვე LED ტექნოლოგიებს, ბუნებრივი განათების ინტეგრაციასა და ჭკვიან მართვის სისტემებს, რაც ამცირებს ენერგიის მოხმარებას და ქმნის ვიზუალურად და ფუნქციურად დაბალანსებულ შიდა გარემოს.',
        metaTitle: 'განათების ინჟინერია და ჭკვიანი მართვა',
        metaDescription:
          'ენერგოეფექტური განათების პროექტირება LED ტექნოლოგიების, ბუნებრივი განათებისა და ჭკვიანი მართვის სისტემების გამოყენებით.',
      },
    ],
  },
  {
    sortOrder: 8,
    icon: 'FaSolarPanel',
    iconColor: 'orange',
    animationColors: ['#2E7D5E', '#2196F3', '#FF9800', '#607D8B', '#FFFFFF'],
    translations: [
      {
        language: Language.EN,
        title: 'Energy Efficiency',
        slug: 'energy-efficiency',
        description:
          'We provide a comprehensive building energy-efficiency service covering design, analysis and recommendations for compliance with applicable regulations. Our team evaluates thermal performance, engineering systems and operational costs to develop optimized solutions for a compliant, energy-efficient and economically sustainable building.',
        metaTitle: 'Building Energy Efficiency Services',
        metaDescription:
          'Building energy-efficiency analysis, system evaluation and optimized design recommendations for compliant and economical operation.',
      },
      {
        language: Language.KA,
        title: 'ენერგოეფექტურობა',
        slug: 'energy-efficiency',
        description:
          'ჩვენ გთავაზობთ შენობების ენერგოეფექტურობის სრულ სერვისს — პროექტირებას, ანალიზსა და რეკომენდაციებს, რომლებიც უზრუნველყოფს მოქმედ რეგულაციებთან შესაბამისობას. ჩვენი გუნდი აფასებს შენობის თბოტექნიკურ მახასიათებლებს, საინჟინრო სისტემებსა და საოპერაციო ხარჯებს ოპტიმიზებული გადაწყვეტების შესამუშავებლად. შედეგად მიიღება სტანდარტებთან თავსებადი, ენერგოეფექტური და ეკონომიკურად გამართლებული შენობა.',
        metaTitle: 'შენობების ენერგოეფექტურობის მომსახურება',
        metaDescription:
          'შენობის ენერგოეფექტურობის ანალიზი, საინჟინრო სისტემების შეფასება და ოპტიმიზებული რეკომენდაციები ეფექტიანი ექსპლუატაციისთვის.',
      },
    ],
  },
  {
    sortOrder: 9,
    icon: 'FaCubes',
    iconColor: 'indigo',
    animationColors: ['#7E57C2', '#3949AB', '#4FC3F7', '#263238', '#ECEFF1'],
    translations: [
      {
        language: Language.EN,
        title: 'BIM MEP Design',
        slug: 'bim-mep-design',
        description:
          'Building Information Modeling (BIM) technology improves architectural and engineering coordination, reduces design errors and increases overall project efficiency. Detailed 3D models and data-driven simulations support accurate planning, efficient execution, and effective management of resources and costs throughout the project lifecycle.',
        metaTitle: 'BIM MEP Design and Engineering Coordination',
        metaDescription:
          'BIM MEP design with coordinated 3D models and data-driven simulations for accurate planning, fewer errors and efficient project delivery.',
      },
      {
        language: Language.KA,
        title: 'BIM MEP პროექტირება',
        slug: 'bim-mep-design',
        description:
          'BIM (Building Information Modeling) ტექნოლოგია აუმჯობესებს არქიტექტურულ და საინჟინრო კოორდინაციას, ამცირებს პროექტირების შეცდომებს და ზრდის პროექტის საერთო ეფექტიანობას. დეტალური 3D მოდელებისა და მონაცემებზე დაფუძნებული სიმულაციების მეშვეობით BIM ხელს უწყობს ზუსტ დაგეგმვას, სწრაფ და ეფექტიან განხორციელებას, ასევე რესურსებისა და ხარჯების მართვას პროექტის მთელი ციკლის განმავლობაში.',
        metaTitle: 'BIM MEP პროექტირება და საინჟინრო კოორდინაცია',
        metaDescription:
          'BIM MEP პროექტირება კოორდინირებული 3D მოდელებითა და სიმულაციებით, რაც ამცირებს შეცდომებს და აუმჯობესებს დაგეგმვასა და შესრულებას.',
      },
    ],
  },
  {
    sortOrder: 10,
    icon: 'FaTools',
    iconColor: 'blue',
    animationColors: ['#2196F3', '#607D8B', '#90A4AE', '#FFFFFF', '#FF9800'],
    translations: [
      {
        language: Language.EN,
        title: 'Design and Installation',
        slug: 'design-and-installation',
        description:
          'We ensure that buildings are properly designed and professionally executed from the beginning. We provide design and installation services for HVAC, water-supply, electrical and fire-protection systems. The result is a safe, energy-efficient and modern space that simplifies building operation and reduces costs.',
        metaTitle: 'Engineering Design and System Installation',
        metaDescription:
          'Professional design and installation of HVAC, water-supply, electrical and fire-protection systems for safe and efficient buildings.',
      },
      {
        language: Language.KA,
        title: 'პროექტირება და მონტაჟი',
        slug: 'design-and-installation',
        description:
          'ჩვენ ვზრუნავთ, რომ თქვენი შენობა თავიდანვე სწორად დაპროექტდეს და ხარისხიანად შესრულდეს. გთავაზობთ გათბობა-გაგრილების, ვენტილაციის, წყალმომარაგების, ელექტრო და სახანძრო სისტემების პროექტირებასა და მონტაჟს. შედეგია უსაფრთხო, ენერგოეფექტური და თანამედროვე სივრცე, რომელიც ამარტივებს შენობის ექსპლუატაციას და ამცირებს ხარჯებს.',
        metaTitle: 'საინჟინრო პროექტირება და სისტემების მონტაჟი',
        metaDescription:
          'HVAC, წყალმომარაგების, ელექტრო და სახანძრო სისტემების პროფესიონალური პროექტირება და მონტაჟი უსაფრთხო შენობებისთვის.',
      },
    ],
  },
  {
    sortOrder: 11,
    icon: 'FaUserTie',
    iconColor: 'lightblue',
    animationColors: ['#1565C0', '#64B5F6', '#90A4AE', '#263238', '#ECEFF1'],
    translations: [
      {
        language: Language.EN,
        title: 'Engineering Consultancy',
        slug: 'engineering-consultancy',
        description:
          'Strategic engineering consultancy supports the creation of functional, energy-efficient and sustainable buildings. We provide design analysis, energy-efficiency evaluations, regulatory-compliance reviews and consultation on innovative technology integration, helping projects achieve optimal performance, cost efficiency and long-term functionality.',
        metaTitle: 'Professional Engineering Consultancy',
        metaDescription:
          'Engineering consultancy covering design analysis, energy efficiency, regulatory compliance and innovative building-system integration.',
      },
      {
        language: Language.KA,
        title: 'საინჟინრო კონსულტაცია',
        slug: 'engineering-consultancy',
        description:
          'სტრატეგიული საინჟინრო კონსულტაცია მნიშვნელოვანია ფუნქციური, ენერგოეფექტური და მდგრადი შენობების შესაქმნელად. ჩვენ გთავაზობთ პროექტის ანალიზს, ენერგოეფექტურობის შეფასებას, რეგულაციებთან შესაბამისობის გადამოწმებასა და ინოვაციური ტექნოლოგიების ინტეგრაციის კონსულტაციას, რაც უზრუნველყოფს პროექტის ოპტიმალურ მუშაობას, ხარჯთეფექტიანობასა და გრძელვადიან ფუნქციურობას.',
        metaTitle: 'პროფესიონალური საინჟინრო კონსულტაცია',
        metaDescription:
          'საინჟინრო კონსულტაცია პროექტის ანალიზის, ენერგოეფექტურობის, რეგულაციებთან შესაბამისობისა და ინოვაციური სისტემების მიმართულებით.',
      },
    ],
  },
  {
    sortOrder: 12,
    icon: 'FaMoneyCheckAlt',
    iconColor: 'green',
    animationColors: ['#43A047', '#A5D6A7', '#607D8B', '#263238', '#ECEFF1'],
    translations: [
      {
        language: Language.EN,
        title: 'Cost Estimation',
        slug: 'cost-estimation',
        description:
          'Accurate cost estimation for construction and engineering projects is essential for effective financial planning and budget management. Our methodology covers detailed analysis of material and labor costs, energy consumption and long-term operating expenses, supporting economic viability and optimized project costs.',
        metaTitle: 'Construction and Engineering Cost Estimation',
        metaDescription:
          'Detailed estimation of material, labor, energy and long-term operating costs for informed planning and optimized engineering project budgets.',
      },
      {
        language: Language.KA,
        title: 'ხარჯების გამოთვლა',
        slug: 'cost-estimation',
        description:
          'მშენებლობისა და საინჟინრო პროექტების ღირებულების ზუსტი შეფასება მნიშვნელოვანია ფინანსური დაგეგმვისა და ბიუჯეტის ეფექტიანი მართვისთვის. ჩვენი მეთოდოლოგია მოიცავს მასალებისა და შრომის ხარჯების, ენერგიის მოხმარებისა და გრძელვადიანი საოპერაციო ხარჯების დეტალურ ანალიზს, რაც უზრუნველყოფს პროექტის ეკონომიკურ გამართლებასა და ხარჯების ოპტიმიზაციას.',
        metaTitle: 'სამშენებლო და საინჟინრო ხარჯების გამოთვლა',
        metaDescription:
          'მასალების, შრომის, ენერგიისა და საოპერაციო ხარჯების დეტალური შეფასება ეფექტიანი დაგეგმვისა და ოპტიმალური პროექტის ბიუჯეტისთვის.',
      },
    ],
  },
];
