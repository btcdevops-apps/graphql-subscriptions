import 'oj-tweets-list/loader';
import "oj-tweet-form/loader";

import * as ko from "knockout";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import * as ResponsiveKnockoutUtils from "ojs/ojresponsiveknockoututils";
import { ITweet } from './model/tweet';
import { graphQLClient } from './graphgl-client';

class FooterLink {
  name: string;
  id: string;
  linkTarget: string;
  constructor({ name, id, linkTarget }: {
    name: string;
    id: string;
    linkTarget: string;
  }) {
    this.name = name;
    this.id = id;
    this.linkTarget = linkTarget;
  }
}

// required to unsubscribe graphql client. It doesn't work if place in RootViewModel
let querySubscription: any;

class RootViewModel {
  smScreen: ko.Observable<boolean>;
  appName: ko.Observable<string>;
  userLogin: ko.Observable<string>;
  footerLinks: ko.ObservableArray<FooterLink>;
  tweets: ko.ObservableArray<ITweet>;

  constructor() {
    document.getElementById("loadingIcon").style.visibility = "hidden";
    // media queries for responsive layouts
    let smQuery: string | null = ResponsiveUtils.getFrameworkQuery("sm-only");
    if (smQuery) {
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
    }

    // header
    // application Name used in Branding Area
    this.appName = ko.observable(" Tweeter Streams Demo");
    // user Info used in Global Navigation area
    // this.userLogin = ko.observable("luis.weir@oracle.com");
    // footer
    this.footerLinks = ko.observableArray([
      new FooterLink({ name: "About Oracle", id: "aboutOracle", linkTarget: "http://www.oracle.com/us/corporate/index.html#menu-about" }),
    ]);

    this.tweets = ko.observableArray([]);
    // graphQLClient.query().then(tweets => {
    //   console.log(tweets);
    //   this.tweets(tweets.reverse());
    // });
    // graphQLClient.subscribe().subscribe((response) => {
    //   console.log(response.data.newTweet);
    //   this.tweets.unshift(response.data.newTweet);
    // });
  }

  tweet = (event: CustomEvent) => {
    console.log(event.detail);
    if(event.detail.create){
      document.getElementById("loadingIcon").style.visibility = "visible";
      console.log("Starting stream with filters: " + event.detail.filters);
      querySubscription = graphQLClient.subscribe(event.detail.filters).subscribe((response) => {
        console.log(response.data.newTweet);
        this.tweets.unshift(response.data.newTweet);
      });
    } else {
      document.getElementById("loadingIcon").style.visibility = "hidden";
      console.log("Stopping stream...");
      querySubscription.unsubscribe();
      graphQLClient.close()
    }
  }
}

export default new RootViewModel();