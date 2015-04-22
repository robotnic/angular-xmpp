# angular-xmpp

is a library,that provides stylable UI Elements for XMPP over Websockets using xmpp-ftw.

Test here:  http://datenkueche.com/buddycloud/

![bootstrap design](https://raw.githubusercontent.com/robotnic/angular-xmpp-services/itemtree/src/assets/docimg/bootstrap.png)

## getting started

```
bower install angular-xmpp
```

To see the buddycloud example (screenshot) open 
```
bower_components/angular-xmpp
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
    <buddycloud room="/user/robotnic@laos.buddycloud.com/posts"></buddycloud>
</xmpp>

```



The templates include alle the javascript that has to be done and tries to keep the html simple.
Your part ist to give them a style.

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




