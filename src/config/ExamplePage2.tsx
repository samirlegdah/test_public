// Libraries
import React, { PureComponent } from 'react';

// Types
import { PluginConfigPageProps, AppPluginMeta, PluginMeta } from '@grafana/data';
import { StruttureEnergiaAppSettings } from 'types';
import { Form, Field, Input } from '@grafana/ui';

interface Props extends PluginConfigPageProps<AppPluginMeta<StruttureEnergiaAppSettings>> {}

// const FormContext = React.createContext({});

interface ApiKey {
  api_key: string;
}

export class ExamplePage2 extends PureComponent<Props> {
  appEditCtrl: any;
  appModel?: PluginMeta;

  constructor(props: Props) {
    super(props);
  }

  render() {
    //const { query } = this.props;

    return {
      /*<div>
        <Form
          onSubmit={(e) => {
            console.log(e);
          }}
        >
          {({ register, control, errors, watch }) => (
            <FormContext.Provider value={{ register, control, errors }}>
              <Field label="API KEY" error="API KEY is required" description="API KEY to get data" required>
                <Input
                  css=""
                  as="input"
                  name="api_key"
                  value=""
                  defaultValue="123"
                  {...register('api_key', { required: true })}
                  onChange={(e) => {
                    control.setValue('api_key', e.currentTarget.value);
                  }}
                ></Input>
              </Field>
            </FormContext.Provider>
          )}
        </Form>
      </div>*/
    };
  }
}
