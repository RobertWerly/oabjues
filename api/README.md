# ⚠️ SÓ DO PROTÓTIPO NA VERCEL — NÃO COPIAR PARA O PORTAL DA OAB

A Vercel não roda PHP, então o protótipo publicado usa esta pasta no lugar
do `bff/jurisprudencia.php`:

| arquivo | papel |
|---|---|
| `jurisprudencia.mjs` | o mesmo BFF do PHP, em Node — guarda a chave e assina |
| `relay.mjs` | a API de jurisprudência empacotada (GERADO — não editar) |

No portal da OAB o papel inteiro é do `bff/jurisprudencia.php`. O
`relay.mjs` usa uma credencial de banco do JurimetriaES que **não acompanha
a entrega** — sem ela, nada aqui funciona. Apagar esta pasta não afeta o
portal em nada.

O `relay.mjs` é temporário: a casa dele é a edge function do Supabase, e
volta para lá apontando `OABJUS_URL` de volta e apagando o arquivo e a
reescrita dele no `vercel.json`.
