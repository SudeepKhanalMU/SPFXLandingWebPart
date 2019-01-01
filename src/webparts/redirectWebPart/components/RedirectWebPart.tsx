import * as React from 'react';
import * as jQuery from 'jquery';

import styles from './RedirectWebPart.module.scss';
import { IRedirectWebPartProps } from './IRedirectWebPartProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IRedirectWebPartState } from './IRedirectWebPartState';
import RedirectWebPartWebPart from '../RedirectWebPartWebPart';

const logo:any = require('./../assets/kp.png');

export class RedirectTimer {
  public interval: number = 5;
  private timerId: number;
  private webPart: RedirectWebPart;

  constructor(webPart: RedirectWebPart) {
    this.webPart = webPart;
  }

  public startTimer(): void {
    this.interval = this.webPart.state.interval;

    this.timerId = setInterval(() => {
      this.interval = this.interval - 1;
      this.webPart.setState(
        {
          interval: this.interval,
          redirectingText: 'You will be redirected to the new site in ' + this.interval + ' seconds '
        }
      );
      //if interval is 0, then redirect
      if(this.interval == 0) {
        clearInterval(this.timerId);
        this.webPart.setState(
          {
            interval: this.interval,
            redirectingText: 'Redirecting now '
          }
        );
        if(this.webPart.newUrl != undefined) {
          setTimeout(() => {
            window.location.href = this.webPart.newUrl;
          }, 500);
        }
      }
    }, 1000);
  }

  public cancelTimer(): void {
    clearInterval(this.timerId);
  }
}

export default class RedirectWebPart extends React.Component<IRedirectWebPartProps, IRedirectWebPartState> {

  public oldUrl: string;
  public newUrl: string;
  public timer: RedirectTimer;

  public constructor(props: IRedirectWebPartProps) {
    super(props);
    this.state = {
      interval: this.props.duration,
      redirectingText: this.props.autoRedirect ? 'You will be redirected to the new site in ' + this.props.duration + ' seconds ' : ''
    };
  }
  public render(): React.ReactElement<IRedirectWebPartProps> {

    //Get requestUrl and redirectUrl fields from query string
    var urlParams = new URLSearchParams(location.search);
    this.newUrl = urlParams.get(this.props.redirectUrlToken);
    this.oldUrl = urlParams.get(this.props.requestUrlToken);


    //Extract the site url from the new url.
    var siteUrl = "";
    if(this.newUrl != null) {
      var indexOfSites = this.newUrl.indexOf("sites/") + 6;
      var indexOfSlashAfterSites = this.newUrl.indexOf('/', indexOfSites);
      siteUrl = this.newUrl.substr(0, (indexOfSlashAfterSites > -1) ? indexOfSlashAfterSites : this.newUrl.length);
      console.log("Extracted site url: " + siteUrl);
      console.log("New URL: " + this.newUrl);
      console.log("Old URL: " + this.oldUrl);
    }

    return (
      <div className={ styles.redirectWebPart }>
        <div className={ styles.container }>
          <div className={ styles.kpmessage }>
            <div className={ styles.row }>
              <div className={ styles.column + 'ms-lg10'}>
                <span className={ styles.title }><img src={logo} width='20%'></img> 
                </span>
                <p className={ styles.subTitle }><b>This site has moved to {escape(siteUrl)}</b></p>

                <p className={ styles.description }>
                  {this.props.autoRedirect ? (this.state.redirectingText) : 'Auto redirection is turned Off '}
                </p>

                <p className={ styles.subTitle }>
                  Requested URL: {this.oldUrl}<br/>
                  Redirected URL: {this.newUrl}
                </p>

                <p className={ styles.subTitle }>Please update your bookmarks accordingly</p>
                <a href={ this.newUrl } className={ styles.button }>
                  <span className={ styles.label }>{escape(this.props.redirectButtonText)}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private setRedirection() {
    if(this.props.autoRedirect) {
      this.timer.startTimer();
    }
  }

  public componentDidMount(): void {
    this.timer = new RedirectTimer(this);
    this.setRedirection();
  }

  public componentDidUpdate(prevProps: IRedirectWebPartProps): void {
    if(prevProps.autoRedirect !== this.props.autoRedirect || prevProps.duration !== this.props.duration){
      console.log('property updated');

      //cancel existing timer
      this.timer.cancelTimer();

      //set new interval from updated duration
      this.setState({
        interval: this.props.duration,
        redirectingText: this.props.autoRedirect ? 'Auto Redirecting in ' + this.props.duration + ' seconds '  : ''
      });

      this.setRedirection();
    }
  }
}
