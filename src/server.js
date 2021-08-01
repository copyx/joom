

import express from 'express';
import {join} from 'path';

const app = express();

app.set("view engine", "pug");
app.set("views", join(__dirname,'/views'));
app.use('/public', express.static(join(__dirname, '/public')));

app.get('/', (req, res) => res.render('home'));

app.listen(3000, () => console.log('Listening on http://localhost:3000'));