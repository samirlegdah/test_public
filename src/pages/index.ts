import { AppRootProps } from '@grafana/data';
import { Inputs } from './Inputs';
import { Feeds } from './Feeds';
import { Tree } from './Tree';
import { Glossario } from './Glossario';
import { Fotovoltaico } from './Fotovoltaico';
import { Pompadicalore } from './Pompadicalore';

export type PageDefinition = {
  component: React.FC<AppRootProps>;
  icon: string;
  id: string;
  text: string;
  role: string[];
};

export const pages: PageDefinition[] = [
  /*{
    component: Inputs,
    icon: 'sign-in-alt',
    id: 'inputs',
    text: 'Misure',
    role: ['Admin'],
  },
  {
    component: Feeds,
    icon: 'database',
    id: 'feeds',
    text: 'Valori',
    role: ['Admin'],
  },*/
  {
    component: Tree,
    icon: 'plug',
    id: 'tree',
    text: 'Rete elettrica',
    role: ['Admin', 'Editor', 'Viewer'],
  },
  {
    component: Fotovoltaico,
    icon: 'sun',
    id: 'fotovoltaico',
    text: 'Fotovoltaico',
    role: ['Admin', 'Editor', 'Viewer'],
  },
  {
    component: Pompadicalore,
    icon: 'fire',
    id: 'pompadicalore',
    text: 'Pompa di calore',
    role: ['Admin', 'Editor', 'Viewer'],
  },
  {
    component: Glossario,
    icon: 'file-alt',
    id: 'glossario',
    text: 'Glossario',
    role: ['Admin', 'Editor'],
  },
];
