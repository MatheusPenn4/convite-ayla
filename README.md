# Convite digital: Ayla Sophia · 1 ano · Jardim Encantado

Site do convite com abertura em envelope animado, informações da festa, contagem regressiva,
confirmação de presença gravada em banco Postgres (Neon) e área administrativa protegida por login.

**Tecnologia:** Next.js 16 (App Router) · TypeScript · Postgres no Neon (driver `pg`) · CSS próprio · ilustrações em SVG próprias.

---

## 1. Preencher as informações pendentes

Tudo fica em **`src/config/event.ts`**. Campos entre colchetes (ex.: `"[NOME DO LOCAL]"`) são
tratados como pendentes e **não aparecem** no convite até serem preenchidos.

| Campo | Exemplo | Enquanto pendente |
|---|---|---|
| `venueName` | `"Espaço Jardim das Flores"` | some da tela |
| `address` | `"Rua das Acácias, 120 - Centro"` | aparece "Local e endereço em breve" / "Localização em breve" (sem link) |
| `cityState` | `"Cuiabá/MT"` | some da tela |
| `rsvpDeadline` | `"2026-11-30"` (AAAA-MM-DD) | o prazo não é exibido |
| `photo.src` | `"/images/ayla.jpg"` | monograma floral "AS" |
| `publicUrl` | `"https://aylasophia.vercel.app"` | usa o domínio de produção da Vercel |

**Horário e fuso:** `startsAt` está como `2026-12-13T19:00:00-04:00` e `timeZone` como
`America/Cuiaba`. Quando a cidade for definida, confirme o fuso: se a festa for em um local com
outro fuso (ex.: São Paulo, UTC−3), troque os dois (`...T19:00:00-03:00` e `America/Sao_Paulo`).
A contagem regressiva usa esse instante exato, independentemente do fuso do celular do convidado.

### Foto da Ayla

1. Coloque a foto em `public/images/` (ex.: `public/images/ayla.jpg`). JPG ou WebP, de preferência
   vertical, com pelo menos 900 px de largura.
2. Em `event.ts`, defina `photo.src: "/images/ayla.jpg"`.
3. Se o rosto ficar fora do centro do arco, ajuste `photo.focalPoint` (ex.: `"50% 25%"` sobe o recorte).
   A foto é apenas recortada, nunca distorcida.

> Ao mudar data, nome ou tema, a imagem de compartilhamento (`/opengraph-image`) é gerada de novo no próximo deploy.

---

## 2. Variáveis de ambiente

O arquivo **`.env.local`** (não vai para o Git) já está criado com o login do admin, o hash da
senha e um segredo aleatório. Falta só a `DATABASE_URL`.

| Variável | O que é |
|---|---|
| `DATABASE_URL` | conexão com o Neon (a Vercel cria sozinha ao ligar o banco) |
| `ADMIN_USERNAME` | login do `/admin` (`Admin`; maiúsculas e minúsculas são aceitas) |
| `ADMIN_PASSWORD_HASH` | hash scrypt da senha (a senha em si não fica salva em lugar nenhum) |
| `AUTH_SECRET` | segredo aleatório que assina a sessão do admin e anonimiza IPs |
| `NEXT_PUBLIC_SITE_URL` | opcional: domínio definitivo |

**Trocar a senha do admin:** rode `npm run hash-password`, digite a nova senha e substitua
`ADMIN_PASSWORD_HASH` no `.env.local` e na Vercel. As sessões abertas com a senha antiga deixam de valer.

Sem a `DATABASE_URL`, o convite abre normalmente, mas a confirmação avisa que **não foi registrada**.
Nunca há sucesso simulado.

---

## 3. Publicar na Vercel com o banco Neon

1. Envie a pasta para um repositório no GitHub (ou use `npx vercel` dentro da pasta).
2. Na Vercel: **Add New → Project →** importe o repositório.
3. Antes do primeiro deploy, em **Settings → Environment Variables**, cadastre `ADMIN_USERNAME`,
   `ADMIN_PASSWORD_HASH` e `AUTH_SECRET` copiando os valores do seu `.env.local`.
4. No projeto: **Storage → Create Database → Neon (Serverless Postgres)** → plano gratuito →
   **Connect** ao projeto. A Vercel adiciona a `DATABASE_URL` sozinha.
5. Copie a `DATABASE_URL` (na aba do banco, em **.env.local → Show secret**) e cole no seu
   `.env.local`. Depois crie as tabelas:

   ```bash
   npm run db:setup
   ```

   Deve aparecer "Banco pronto". Pode rodar de novo quando quiser, não apaga dados.
   (Alternativa: colar o conteúdo de `db/schema.sql` no SQL Editor do Neon.)
6. Faça o deploy (ou **Redeploy**, para a Vercel carregar as variáveis novas).
7. Teste: confirme uma presença com um nome de teste, entre em `/admin`, veja o registro e exclua.
8. Antes de mandar no WhatsApp, teste o link em <https://developers.facebook.com/tools/debug/>
   para ver a prévia com título, descrição e imagem. O WhatsApp guarda a prévia em cache: se mudar
   a imagem depois de compartilhar, ela pode demorar a atualizar.

---

## 4. Rodar no computador

```bash
npm install
```

```bash
npm run dev
```

Abra <http://localhost:3000> (convite) e <http://localhost:3000/admin> (lista). Com a
`DATABASE_URL` do Neon no `.env.local`, o ambiente local grava no mesmo banco da produção, então
use nomes de teste e apague-os depois pelo `/admin`.

Para conferir tipos e o build de produção:

```bash
npm run typecheck
```

```bash
npm run build
```

---

## Área administrativa (`/admin`)

Grupos confirmados, busca por nome (ignora acentos e apóstrofos), total de confirmações e de
pessoas, edição de nomes e integrantes, exclusão com confirmação, exportação CSV (UTF-8, separador
`;`, abre direto no Excel em português, protegido contra fórmulas) e botão Sair.

- O login é conferido no servidor (scrypt + comparação em tempo constante).
- A sessão é um cookie `httpOnly`, assinado e válido por 7 dias. Toda página, ação e exportação do
  `/admin` confere a assinatura no servidor.
- Máximo de 8 tentativas de login a cada 15 minutos por origem.
- Não existe cadastro: só quem tem o login e a senha entra.

---

## Estrutura

```
src/config/event.ts            ← dados editáveis do convite
src/app/page.tsx               ← convite (envelope, apresentação, festa, contagem, confirmação)
src/app/opengraph-image.tsx    ← imagem 1200×630 para o WhatsApp
src/app/api/rsvp/route.ts      ← recebe confirmações (validação, limite de envios, gravação atômica)
src/app/admin/                 ← login, painel, ações (editar/excluir), exportação CSV
src/components/garden/         ← ilustrações SVG (flores, folhas, borboletas, pétalas)
src/components/envelope/       ← abertura animada
src/components/invite/         ← blocos do convite
src/components/rsvp/           ← formulário e mensagem de sucesso
src/lib/db.ts                  ← conexão com o Postgres
src/lib/admin-auth.ts          ← login e sessão do admin
src/lib/validation.ts          ← regras de nomes (mesmas no navegador e no servidor)
db/schema.sql                  ← tabelas e funções do banco
scripts/db-setup.mjs           ← npm run db:setup
scripts/hash-password.mjs      ← npm run hash-password
assets/fonts/                  ← fontes (licença OFL) usadas na imagem de compartilhamento
```

### Segurança e privacidade, em resumo

- O banco só é acessível com a `DATABASE_URL`, que fica apenas no servidor. O navegador nunca fala
  com o banco: o convite chama `/api/rsvp`, que valida e grava.
- Limite de 10 confirmações a cada 10 minutos por origem, contado no próprio banco (funciona em
  serverless). Só um hash do IP é guardado.
- Cada envio leva um identificador aleatório: cliques repetidos ou novas tentativas devolvem o
  mesmo registro, sem duplicar. Homônimos de grupos diferentes são aceitos normalmente.
- O total de pessoas é calculado pelo banco a partir dos nomes; um total enviado pelo navegador é ignorado.
- Nomes não são registrados em logs, não vão para URLs, nem para a imagem de compartilhamento.
- O navegador lembra localmente que houve uma confirmação, apenas para mostrar essa mensagem ao voltar.
  O registro oficial é o do banco.

### Limites configuráveis

`rsvp.maxCompanions` (15) e `rsvp.maxNameLength` (120) em `event.ts`. Se mudar, ajuste também os
números correspondentes em `rsvp_name_is_valid` / `rsvp_companions_are_valid` no `db/schema.sql`
e rode `npm run db:setup` de novo.

### Música

Não há música, porque nenhum arquivo foi fornecido. Se quiserem incluir, ela deve ficar desligada
por padrão e ter botões visíveis de tocar/pausar.
