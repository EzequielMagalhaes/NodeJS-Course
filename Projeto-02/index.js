const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const { News } = require('./public/News.js');

mongoose.connect('mongodb+srv://Zekiel:5mmOXfV2HSCNPnFN@cluster0.b9lahkf.mongodb.net/portalnews?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB conectado com sucesso'); // caso ocorra tudo certo;
}).catch((err) => {
    console.log(err.message); // exibe mensagem de erro;
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => { // pagina home
    console.log(req.query);  // url:port/?busca= xxx
        if (!req.query.busca) {
    News.find({}).sort({ '_id': -1 }).then((news) => {
        news = news.map((val)=>{
            return {
                title: val.title,
                image: val.image,
                category: val.category,
                content: val.content,
                shortContent: val.content.substring(0, 152), //campo nao precisa existir no BD para poder criar direto no código 
                slug: val.slug
            }
        })

        res.render('home', { news: news });
    }).catch((err) => {
        console.log(err.message);
        res.sendStatus(500);
    });
    } else {
        res.render('busca', {});
    }
});

app.get('/:slug', (req, res) => { // pagina individual da notícia
    //res.send(req.params.slug)                  /* $inc pra incrementar o campo views*/
    News.findOneAndUpdate({slug: req.params.slug}, {$inc: {views: 1}}, {new: true}).then((response)=>{ // começa a filtrar o que vem do banco de dados
        //console.log(response);
        res.render('single', {news:response});
    }).catch((err)=>{
        console.log(err.message);
        res.sendStatus(500);
    });
});

app.listen(3000, () => {
    //require('child_process').exec(`start "Google Chrome": http://localhost:3000/`); // para abrir automaticamente o localhost
    console.log('Server rodando!');
});
