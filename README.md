# angular-xmpp

This is a library, that provides styleable UI Elements for XMPP over Websockets using [xmpp-ftw](https://xmpp-ftw.jit.su/) and [angular-xmpp-services](https://github.com/robotnic/angular-xmpp-services/).

Test here:  http://datenkueche.com/buddycloud/v4/ (username: elke, password: bbb) or (username:u9@buddycloud.com, password:bbb). 

Here an example how to use the lib
![bootstrap design](https://raw.githubusercontent.com/robotnic/angular-xmpp-services/master/src/assets/docimg/bootstrap.png)

Let's see the directives
![bootstrap design](https://raw.githubusercontent.com/robotnic/angular-xmpp-services/itemtree/src/assets/docimg/bootstrap-annotated.png)

Other design (conversjs clone - prove of concept)
![convers clone](https://raw.githubusercontent.com/robotnic/angular-converse/master/screenshots/beta.png)

## getting started

```
bower install angular-xmpp
```

To see the buddycloud example (screenshot) open 
```
bower_components/angular-xmpp/index.html
```
in your brower.

## example xmpp chat
```

<xmpp host="https://laos.buddycloud.com">
    <xmpplogin defaultdomain="laos.buddycloud.com"></xmpplogin>
    <xmpproster></xmpproster>
    <xmppminichat></xmppminichat>
</xmpp>

```

## example xmpp muc
```

<xmpp host="https://laos.buddycloud.com">
    <xmpplogin></xmpplogin>
    <xmppmuc room="seehaus@channels.buddycloud.com"></xmppmuc>
</xmpp>

```

## example xmpp buddycloud

```
<xmpp host="https://laos.buddycloud.com">
    <xmpplogin></xmpplogin>
    <buddycloud node="/user/robotnic@laos.buddycloud.com/posts">
        <buddycloud-stream></buddycloud-stream>
    </buddycloud>
</xmpp>

```


# Combine with your project

## Angular binding exampe
```
<input ng-mode="node"/>
<buddycloud node="node" onchangenode="nodechangedinsidedirective(node)">
    <buddycloud-stream></buddycloud-stream>
</buddycloud>
```

In your controller
```
...
$scope.node="/user/robotnic@laos.buddycloud.com/posts";
$scope.nodechangedinsidedirective=function(node){
    //change hashtag or whatever
}

```

# Styling

The templates include all the javascript that has to be done and tries to keep the html simple.
Your part is to give them a style.

## how to start

```
git clone https://github.com/robotnic/angular-xmpp
```

## directory structure

The structure comes from ng-boilerplate. All the angular factorys are in a seperate project called [angular-xmpp-services](https://github.com/robotnic/angular-xmpp-services/).


```
├── app.js
├── buddycloud
│   ├── buddycloud.js
│   └── buddycloud.less
├── buddycloud-affiliations
│   ├── buddycloud-affiliations.js
│   └── template.tpl.html
├── buddycloud-nodelist
│   ├── buddycloud-nodelist.js
│   ├── nodelist.less
│   └── template.tpl.html
├── buddycloud-search
│   ├── search.js
│   └── template.tpl.html
├── buddycloud-stream
│   ├── buddycloud-stream.js
│   └── template.tpl.html
├── login
│   ├── login.js
│   └── template.tpl.html
├── minichat
│   ├── chatstyle.css
│   ├── minichat.js
│   ├── minichat.less
│   └── template.tpl.html
├── navbar
│   └── template.tpl.html
├── xmppcore
│   └── xmppcore.js
├── xmppform
│   ├── template.tpl.html
│   ├── xmppform.js
│   └── xmppform.less
└── xmpproster
    ├── nodelist.less
    ├── roster.js
    └── template.tpl.html

```



## grunt

If you want to make changes. You have to run the grunt task builder.

```
grunt watch --force
```
The result have be views in the "build" folder


If you are happy with your work run 
```
grunt compile
```
This will make more optimation.


















