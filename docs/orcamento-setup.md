# Formulário de Orçamento — Setup

Rota `/orcamento`: wizard de 6 passos que envia o pedido por **e-mail (Resend)** e,
opcionalmente, salva numa **Google Sheet** (via Apps Script). Tudo passa pela função
serverless `api/quote.ts` (rodando na Vercel) — a API key nunca fica no frontend.

## 1. Variáveis de ambiente

Local: copie `.env.example` para `.env.local` e preencha.
Produção: configure as mesmas em **Vercel → Project → Settings → Environment Variables**.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Chave da API do Resend (https://resend.com/api-keys) |
| `QUOTE_TO_EMAIL` | ✅ | E-mail que recebe os orçamentos |
| `RESEND_FROM` | ➖ | Remetente. Testes: `Orçamentos <onboarding@resend.dev>`. Produção: e-mail do seu domínio verificado |
| `SHEETS_WEBHOOK_URL` | ➖ | URL do Apps Script Web App (deixe vazio para desativar a planilha) |

> ⚠️ A key colada no chat deve ser **rotacionada** no painel do Resend por segurança.

## 2. Resend

1. Crie conta em resend.com e gere uma API key.
2. **Testes:** pode usar `onboarding@resend.dev` como remetente — só envia para o
   e-mail dono da conta. Suficiente aqui, pois o destino (`QUOTE_TO_EMAIL`) é você.
3. **Produção:** verifique seu domínio (Resend → Domains) e use algo como
   `orcamentos@seudominio.com` em `RESEND_FROM`, para não cair em spam.

## 3. Google Sheets (opcional)

1. Crie uma planilha no Google Sheets.
2. Menu **Extensões → Apps Script**, apague o conteúdo e cole o script abaixo.
3. **Implantar → Nova implantação → Tipo: App da Web.**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Copie a **URL do app da Web** e coloque em `SHEETS_WEBHOOK_URL`.

```javascript
// Apps Script — recebe o POST da função serverless e adiciona uma linha.
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var d = JSON.parse(e.postData.contents);

    // Cria o cabeçalho na primeira execução.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Data', 'Tipo', 'Funcionalidades', 'Design', 'Prazo', 'Investimento',
        'Referências', 'Nome', 'E-mail', 'WhatsApp', 'Empresa', 'Mensagem', 'Idioma'
      ]);
    }

    sheet.appendRow([
      d.submittedAt || new Date().toISOString(),
      d.projectType || '',
      (d.scope || []).join(', '),
      d.design || '',
      d.timeline || '',
      d.budget || '',
      d.references || '',
      d.name || '',
      d.email || '',
      d.whatsapp || '',
      d.company || '',
      d.message || '',
      d.locale || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

> Os valores salvos são os **códigos estáveis** (ex: `ecommerce`, `5to15`). Se
> quiser rótulos legíveis na planilha, dá pra mapear no Apps Script depois.

## 4. Testar o envio (sem abrir o navegador)

Com o projeto rodando na Vercel (ou `vercel dev`), você pode testar a função:

```bash
curl -X POST https://SEU-SITE.vercel.app/api/quote \
  -H "Content-Type: application/json" \
  -d '{"projectType":"ecommerce","scope":["payments","auth"],"design":"from_scratch","timeline":"1to3","name":"Teste","email":"teste@exemplo.com","whatsapp":"12999999999","locale":"pt"}'
```

Resposta esperada: `{"ok":true}` e o e-mail chega em `QUOTE_TO_EMAIL`.

## 5. Deploy

A Vercel detecta a pasta `api/` automaticamente como funções serverless e o
`vercel.json` cuida do roteamento SPA (client-side routing em `/orcamento`).
Nenhuma config extra é necessária além das variáveis de ambiente.
