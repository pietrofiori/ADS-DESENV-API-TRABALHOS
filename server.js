// ~ pietro fiori 
// sor , vou deixar as URL's aqui para facilitar caso queira
// cliente - http://localhost:8001/pedidos
// adm - http://localhost:8001/admin/produtos


const restify = require('restify');
const errors = require('restify-errors');

const servidor = restify.createServer({
    name: 'lojinha',
    version: '1.0.0'
    
    });
    
    servidor.use(restify.plugins.acceptParser (servidor.acceptable));
    servidor.use(restify.plugins.queryParser());
    servidor.use(restify.plugins.bodyParser())
    
    servidor.listen(8001, function() {
    console.log("%s executando em %s", servidor.name, servidor.url);
    })
    
    var knex = require('knex')({
        client: "mysql",
        connection: {
    
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'ds_api_loja'
        }
        });

// CONSULTAR OS SLIDES - AULA 10 REST      --> se basear neles

//cidades primeiro
servidor.post('/cidades', (req, res, next) => {
  const { nome } = req.body;

  knex('cidades')
    .insert({ nome })
    .then(() => {
      res.send({ message: 'Cidade criada com sucesso' });
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.BadRequestError('Erro interno do servidor'));
    });
});


//rotas


//cliente 


// cadastro
servidor.post('/clientes', (req, res, next) => {
  const { nome, altura, nascimento, cidade_id } = req.body;

  knex('clientes')
    .insert({ nome, altura, nascimento, cidade_id })
    .then(() => {
      res.send({ message: 'cliente cadastrado com sucesso' });
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.BadRequestError('Erro interno do servidor'));
    });
});


servidor.get('/produtos', (req, res, next) => {
  knex('produtos')
    .then((dados) => {
      res.send(dados);
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.BadRequestError('este produto não foi encontrado'));
    });
});


servidor.post('/pedidos', (req, res, next) => {
  const { horario, endereco, cliente_id, produtos } = req.body;

  knex.transaction((trx) => {
    return trx('pedidos')
      .insert({ horario, endereco, cliente_id })
      .then(([pedido_id]) => {
        const pedidosProdutos = produtos.map((produto) => ({
          pedido_id,
          produto_id: produto.produto_id,
          preco: produto.preco,
          quantidade: produto.quantidade,
        }));

        return trx('pedidos_produtos').insert(pedidosProdutos);
      });
  })
    .then(() => {
      res.send({ message: 'Pedido realizado com sucesso' });
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.BadRequestError('pedido nao realizado'));
    });
});

servidor.get('/pedidos', (req, res, next) => {
  knex('pedidos')
    .then((dados) => {
      res.send(dados);
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.BadRequestError('pedido nao realizado'));
    });
});

//endpoint 

//administrator  --> so os adm podem adicionar os produtos 

servidor.post('/admin/categorias', (req, res, next) => {
  const { nome } = req.body;

  knex('categorias')
    .insert({ nome })
    .then(() => {
      res.send({ message: 'Categoria criada com sucesso' });
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.BadRequestError('algo deu errado'));
    });
});


servidor.post('/admin/produtos', (req, res, next) => {
  const { nome, preco, quantidade, categoria_id } = req.body;

  knex('produtos')
    .insert({ nome, preco, quantidade, categoria_id })
    .then(() => {
      res.send({ message: 'Produto criado com sucesso' });
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.InternalServerError('Erro interno do servidor'));
    });
});


servidor.put('/admin/produtos/:id', (req, res, next) => {
  const { id } = req.params;
  const { nome, preco, quantidade, categoria_id } = req.body;

  knex('produtos')
    .where('id', id)
    .update({ nome, preco, quantidade, categoria_id })
    .then((updatedCount) => {
      if (updatedCount === 0) {
        return next(new errors.NotFoundError('produto não encontrado'));
      }
      res.send({ message: 'produto atualizado com sucesso' });
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.BadRequestError('erro interno do servidor'));
    });
});

// deletar 

servidor.del('/admin/produtos/:id', (req, res, next) => {
  const { id } = req.params;

  knex('produtos')
    .where('id', id)
    .del()
    .then((deletedCount) => {
      if (deletedCount === 0) {
        return next(new errors.NotFoundError('produto não encontrado'));
      }
      res.send({ message: 'Produto excluído com sucesso' });
    })
    .catch((error) => {
      console.error(error);
      return next(new errors.BadRequestError('Erro interno do servidor'));
    });
});
