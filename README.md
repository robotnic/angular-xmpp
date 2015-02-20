# angular-xmpp

is a library,that provides stylable UI Elements for XMPP oder Websockets using xmpp-ftw.

Test here:  http://datenkueche.com/buddycloud/



## getting started

```
<script type="text/javascript" src="../assets/scripts/primus.js"></script>
<!-- compiled CSS -->
<link rel="stylesheet" type="text/css" href="../assets/ngbp-0.3.2.css" />
<!-- compiled JavaScript -->
<script type="text/javascript" src="../assets/ngbp-0.3.2.js"></script>
```

## example xmpp chat
```

<xmpp host="https://laos.buddycloud.com">
    <xmpplogin></xmpplogin>
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
    <buddycloud room="robotnic@laos.buddycloud.com"></buddycloud>
</xmpp>

```



The templates include alle the javascript that has to be done and tries to keep the html simple.
Your part ist to give them a style.

## javascipt
