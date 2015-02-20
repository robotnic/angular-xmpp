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

## xmpp chat
```

<xmpp host="https://laos.buddycloud.com" oninit="initxmpp(scope)">
<div style="position:absolute;top:200px;left:300px;z-index:1000;background-color:white;">
    <xmpplogin></xmpplogin>
    <div style="display:none">
        <xmpproster></xmpproster>
    </div>
</div>
<xmppminichat oninit="initchat(scope)"></xmppminichat>

```
