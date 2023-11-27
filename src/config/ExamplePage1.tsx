// Libraries
import React, { PureComponent } from 'react';

// Types
import { PluginConfigPageProps, AppPluginMeta } from '@grafana/data';
import { StruttureEnergiaAppSettings } from 'types';

interface Props extends PluginConfigPageProps<AppPluginMeta<StruttureEnergiaAppSettings>> {}

export class ExamplePage1 extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { query } = this.props;

    return <div></div>;
  }
}
