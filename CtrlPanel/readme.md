Here lies stuff for creating an admin panel, that gets websocket conversions and logs from our websocket
servers. Pretty much all the html is generated, so if you set up a local server (see LocalServer.mjs) on port 12345
that knows to give you MIChat.mjs (you may need to fiddle with the path depending on how your local server interprets it):

```
<!DOCTYPE html>
<html>

<head><link rel="stylesheet" href="../../main.css">
<link rel="stylesheet" href="resizer.css">
<title>Panel</title>
</head>

<body>
<script type="module" src="http://localhost:12345/MIChat.mjs"></script>
</body>

</html>
```
