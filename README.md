# angular-xmpp

This is a library, that provides styleable UI Elements for XMPP over Websockets using [xmpp-ftw](https://xmpp-ftw.jit.su/) and [angular-xmpp-services](https://github.com/robotnic/angular-xmpp-services/).

![diagram](https://raw.githubusercontent.com/robotnic/angular-xmpp/master/diagram.png);

## Demo app

Try here:  https://buddycloud.org For testing, open the "login" dropdown and click "sign in". At the moment username and password are prefilled. You can play with a real account with real data. 

Known bugs:  search is not working at the moment

Screenshot
![bootstrap design](https://raw.githubusercontent.com/robotnic/angular-xmpp-services/master/src/assets/docimg/bootstrap.png)

## Let's see the directives
![bootstrap design](https://raw.githubusercontent.com/robotnic/angular-xmpp-services/itemtree/src/assets/docimg/bootstrap-annotated.png)

## But it can look totaly different
depending on your design skills (conversjs clone - prove of concept)
![convers clone](https://raw.githubusercontent.com/robotnic/angular-converse/master/screenshots/beta.png)

## getting started

```
bower install angular-xmpp
```

To see the buddycloud example (screenshot) open 
```
bower_components/angular-xmpp/bin/index.html
```
in your browser.

### connect to server
To connect to the xmpp server we need an [xmpp-ftw server](You will maybe find something like tha://github.com/xmpp-ftw/xmpp-ftw-demo/).
You can install that on your localhost.
To make buddycloud working read this [posting](https://github.com/xmpp-ftw/xmpp-ftw-buddycloud/issues/32#issuecomment-70631102) !!!

host: xmpp-ftw server address

defaultdomain: if the is no "@"sign in the login name the defaultdomain will be added.
```xml

<xmpp host="https://prod.buddycloud.com"  defaultdomain="laos.buddycloud.com" > </xmpp>
```
The default domain is also nessessary if you allow anonymous logins.




## The directives

### login + roster
```xml

<xmpp host="https://prod.buddycloud.com">
    <xmpplogin defaultdomain="laos.buddycloud.com"></xmpplogin>
    <xmpproster></xmpproster>
</xmpp>

```
<a href="http://plnkr.co/edit/0HRKU6?p=preview" target="_blank">plunker</a> (no styling)<br/>
<a href="http://plnkr.co/edit/uaX29I7DH7DTuZMRA4V5?p=preview" target="_blank">plunker</a> (bootstrap styling)

### include the chat

```javascript
angular.module("XmppApp", ["AngularXmpp", 'templates-app'])
      .controller("page", function($scope) {
        $scope.openchat = function(jid) {
          console.log("openchat", jid, $scope.chat);
          $scope.chat.openchat(jid);
        }
        $scope.initchat = function(chat) {
          $scope.chat = chat;
        }
      });
```

```xml
<xmpp host="https://prod.buddycloud.com" >
      <xmpplogin></xmpplogin>
      <xmpproster onopenchat="openchat(jid)"></xmpproster>
      <xmppminichat oninit="initchat(scope)"></xmppminichat>
</xmpp>
```


<a href="http://plnkr.co/edit/0NZGDmfBPDDXYAEXlezV?p=preview" target="_blank">plunker</a> (default styling)

#### use your own template

Use the attribute 'template-url' to replace the html template by your own html.
Here a small example how to start. 

```html
<xmpproster onopenchat="openchat(jid)" template-url="roster.html"></xmpproster>
```

<a href="http://plnkr.co/edit/wVWXVn3HJNnG77kLrzyc?p=preview" target="_blank">plunker</a>

It's very handy to use the build in angular json formatter.
```
<pre>{{xmpp.model.roster|json}}</pre>
```

You also can use a json-formatter plugin to observe the model as in this example:

<a href="http://plnkr.co/edit/W8jIj1d00Wh30UYGrKuh?p=preview" target="_blank">plunker</a>

## example xmpp muc
Say hello to the developers hangout.
```xml
<xmpp host="https://prod.buddycloud.com" defauldomain="laos.buddycloud.com" anonymous="true">
    <xmppmuc room="seehaus@channels.buddycloud.com" nick="guest"></xmppmuc>
</xmpp>

```
<a href="http://plnkr.co/edit/WcWrUoylvdaODTBlKJht?p=preview">plunker</a> (explore the model)<br/>
<a href="http://plnkr.co/edit/TL8RBheavGbu7xodAPED?p=preview" target="_blank">plunker</a> (simple template)

### example xmpp buddycloud

```xml
<xmpp host="https://prod.buddycloud.com">
    <xmpplogin></xmpplogin>
    <buddycloud node="/user/robotnic@buddycloud.com/posts">
        <buddycloud-stream></buddycloud-stream>
    </buddycloud>
</xmpp>

```

<a href="http://plnkr.co/edit/qd7tIpQT2zvuhE9wsMbP?p=preview" target="_blank">plunker</a> (working example)<br/>
<a href="http://plnkr.co/edit/hysY7CLfUngw2nRivI2j?p=preview" target="_blank">plunker</a> (model + post field )

## Combine with your project

### Buddycloud events
```html
<input ng-mode="node"/>
<buddycloud node="node" onchangenode="nodechangedinsidedirective(node)">
    <buddycloud-stream></buddycloud-stream>
</buddycloud>
```

In your controller
```javascript
...
$scope.node="/user/robotnic@buddycloud.com/posts";
$scope.nodechangedinsidedirective=function(node){
    //change hashtag or whatever
}

```

## Styling

The templates include all the javascript that has to be done and tries to keep the html simple.
Your part is to give them a style.

### how to start

```
git clone https://github.com/robotnic/angular-xmpp
```

### directory structure

The structure comes from ng-boilerplate. All the angular factorys are in a seperate project called [angular-xmpp-services](https://github.com/robotnic/angular-xmpp-services/).

js, html and less lives together and build a directive
```
├── app.js
├── buddycloud
│   ├── buddycloud.js
│   └── buddycloud.less
├── buddycloud-nodelist
│   ├── buddycloud-nodelist.js
│   ├── nodelist.less
│   └── template.tpl.html
....
├── minichat
│   ├── minichat.js
│   ├── minichat.less
│   └── template.tpl.html
├── navbar
│   └── template.tpl.html
├── xmppcore
│   └── xmppcore.js

```



## grunt

If you want to make changes to this repository. You have to run the grunt task builder.

```command
grunt watch --force
```
The result is in the "build" folder


If you are happy with your work run 
```command
grunt compile
```
This will make more optimation.


















