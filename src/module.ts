import { ComponentClass } from 'react';
import { ExampleConfigCtrl } from './legacy/config';
import { AppPlugin, AppRootProps } from '@grafana/data';
import { ExampleRootPage } from './ExampleRootPage';
import { StruttureEnergiaAppSettings } from './types';
import { Inputs } from 'components/AppConfigInputs';
import { Feeds } from 'components/AppConfigFeeds';
//import { Inputs } from 'pages/Inputs';

export { ExampleConfigCtrl as ConfigCtrl };

export const plugin = new AppPlugin<StruttureEnergiaAppSettings>();

plugin
  .setRootPage((ExampleRootPage as unknown) as ComponentClass<AppRootProps>)
  .addConfigPage({
    title: 'Conf. Misure',
    icon: 'fa fa-database',
    // @ts-ignore - Would expect a Class component, however works absolutely fine with a functional one
    // Implementation: https://github.com/grafana/grafana/blob/fd44c01675e54973370969dfb9e78f173aff7910/public/app/features/plugins/PluginPage.tsx#L157
    body: Inputs,
    id: 'configuration1',
  })
  .addConfigPage({
    title: 'Conf. Valori',
    icon: 'fa fa-database',
    // @ts-ignore - Would expect a Class component, however works absolutely fine with a functional one
    // Implementation: https://github.com/grafana/grafana/blob/fd44c01675e54973370969dfb9e78f173aff7910/public/app/features/plugins/PluginPage.tsx#L157
    body: Feeds,
    id: 'configuration',
  });
