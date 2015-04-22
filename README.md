# angular-xmpp

This is a library, that provides stylable UI Elements for XMPP over Websockets using xmpp-ftw.

Test here:  http://datenkueche.com/buddycloud/

Here an example how to use the lib
![bootstrap design](https://raw.githubusercontent.com/robotnic/angular-xmpp-services/itemtree/src/assets/docimg/bootstrap.png)

Let's see the directives
![bootstrap design](https://raw.githubusercontent.com/robotnic/angular-xmpp-services/itemtree/src/assets/docimg/bootstrap-annotated.png)

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


















