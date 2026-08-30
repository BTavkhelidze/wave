type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>> | null;
};

export function JsonLd({ data }: JsonLdProps) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
