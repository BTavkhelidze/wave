export interface ISingleServiceLanding {
  id: number;
  title: string;
  icon: React.JSX.Element;
}

export interface IServices {
  id: number;
  title_ka?: string;
  title_en?: string;
  description_en: string;
  description_ka: string;
  icon: string;
  colors: string[];
  created_at: string;
  iconColor: string;
}
