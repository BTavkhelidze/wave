import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BlogStatus, Language } from '@prisma/client';
import { CreateBlogDto } from './create-blog.dto';

const validPayload = {
  coverImageKey: 'images/cover.webp',
  coverImageUrl: 'https://bucket.example.com/images/cover.webp',
  status: BlogStatus.DRAFT,
  isFeatured: false,
  translations: [
    {
      language: Language.KA,
      title: 'Georgian title',
      slug: 'english-title',
      excerpt: 'Georgian excerpt',
      content: '<p>Georgian content</p>',
      metaTitle: 'Georgian title | Wave',
      metaDescription: 'Georgian meta description',
    },
    {
      language: Language.EN,
      title: 'English title',
      slug: 'english-title',
      excerpt: 'English excerpt',
      content: '<p>English content</p>',
      metaTitle: 'English title | Wave',
      metaDescription: 'English meta description',
    },
  ],
};

describe('CreateBlogDto', () => {
  it('accepts a shared blog payload with KA and EN translations', async () => {
    const dto = plainToInstance(CreateBlogDto, validPayload);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects a payload without both translations', async () => {
    const dto = plainToInstance(CreateBlogDto, {
      ...validPayload,
      translations: [validPayload.translations[0]],
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'translations')).toBe(
      true,
    );
  });

  it('rejects invalid translation fields', async () => {
    const dto = plainToInstance(CreateBlogDto, {
      ...validPayload,
      translations: [
        {
          ...validPayload.translations[0],
          slug: 'Invalid Slug',
        },
        validPayload.translations[1],
      ],
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'translations')).toBe(
      true,
    );
  });
});
