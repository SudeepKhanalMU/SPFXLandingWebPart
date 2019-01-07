import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  PropertyPaneSlider
} from '@microsoft/sp-webpart-base';

import * as strings from 'RedirectWebPartWebPartStrings';
import RedirectWebPart from './components/RedirectWebPart';
import { IRedirectWebPartProps } from './components/IRedirectWebPartProps';

export default class RedirectWebPartWebPart extends BaseClientSideWebPart<IRedirectWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IRedirectWebPartProps > = React.createElement(
      RedirectWebPart,
      {
        redirectUrlToken: this.properties.redirectUrlToken,
        requestUrlToken: this.properties.requestUrlToken,
        duration: this.properties.duration,
        redirectButtonText: this.properties.redirectButtonText,
        autoRedirect: this.properties.autoRedirect
      }
    );

    ReactDom.render(element, this.domElement);
  }


  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('redirectUrlToken', {
                  label: 'Redirect URL Token'
                }),
                PropertyPaneTextField('requestUrlToken', {
                  label: 'Request URL Token',
                }),
                PropertyPaneSlider('duration', {
                  min: 1,
                  max: 15,
                  showValue: true,
                  step: 1,
                  label: 'Redirection Interval (seconds)',
                }),
                PropertyPaneTextField('redirectButtonText', {
                  label: 'Redirection Button Text',
                  value: 'Redirect'
                }),
                PropertyPaneToggle('autoRedirect', {
                  label: 'Auto Redirect',
                  onText: 'On',
                  offText: 'Off'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
