'use strict'
//Link this script into a Panel and you'll get incoming websocket connections from an AdminPipeExt.mjs using server
const HOST = 'localhost';
const PORT = '80';
const SCHEME = "ws";

import AdminClient from "./AdminClient.mjs";
let cli = new AdminClient(SCHEME, HOST, PORT);

