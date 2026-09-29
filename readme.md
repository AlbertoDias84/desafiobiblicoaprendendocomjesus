# Desafio Bíblico

Quiz bíblico responsivo, feito com HTML semântico, CSS e JavaScript puro. Inclui 180 perguntas em 12 categorias, níveis de dificuldade, timer opcional, áudio sintetizado, recordes locais e suporte PWA offline.

## Como rodar

Você pode abrir `index.html` diretamente no navegador para jogar. O jogo e o LocalStorage funcionam nessa forma; navegadores só permitem instalar o service worker/PWA em `localhost` ou HTTPS.

Para testar todas as funções PWA localmente, use o Live Server do VS Code (porta sugerida: 5500) ou rode na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

### Abrir no celular pela rede Wi-Fi

O endereço `localhost` aponta para o próprio aparelho. Para abrir o site servido pelo computador no celular, conecte os dois à mesma rede Wi-Fi e execute no computador:

```bash
python -m http.server 8000 --bind 0.0.0.0
```

Descubra o endereço IPv4 do computador (no Windows, `ipconfig`) e abra no celular `http://ENDERECO-DO-COMPUTADOR:8000`, por exemplo `http://192.168.1.20:8000`. Se o Windows perguntar, permita o acesso do Python na rede privada. Para acessar fora dessa rede, publique os arquivos no GitHub Pages ou Netlify e use o link HTTPS.

## Como adicionar perguntas

Edite `js/perguntas.js`. Cada pergunta é uma entrada no array da categoria, neste formato compacto:

```js
['médio', 'Enunciado?', 'Alternativa A|Alternativa B|Alternativa C|Alternativa D', 2,
 'Explicação da resposta.', 'Livro 1:2-3']
```

As alternativas devem ser separadas por `|`; o índice correto começa em zero (0 para A, 1 para B, 2 para C e 3 para D). Use exatamente `fácil`, `médio` ou `difícil`. Para uma nova categoria, acrescente outra chave ao objeto `raw`.

## Publicar

### GitHub Pages

1. Envie a pasta para um repositório GitHub.
2. Em **Settings → Pages**, escolha a branch principal e a pasta raiz.
3. Salve e abra o endereço publicado. O HTTPS habilita instalação e cache offline.

### Netlify

Arraste a pasta do projeto para o painel do Netlify ou conecte o repositório. Não há etapa de build; a raiz do site é a pasta que contém `index.html`.

## Arquivos principais

- `js/app.js`: navegação, partida, pontuação, timer e compartilhamento.
- `js/perguntas.js`: banco de perguntas com referências e explicações.
- `js/storage.js`: recordes, estatísticas e preferência de áudio no LocalStorage.
- `js/audio.js`: efeitos gerados com Web Audio API.
- `service-worker.js` e `manifest.json`: suporte instalável e offline.

Os ícones PNG de 192 e 512 px estão incluídos. Para recriá-los, rode `python assets/generate_icons.py` (usa somente a biblioteca padrão); navegadores compatíveis também podem usar o SVG incluído no manifest.
