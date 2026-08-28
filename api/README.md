# ⚠️ SÓ DO PROTÓTIPO NA VERCEL — NÃO COPIAR PARA O PORTAL DA OAB

A Vercel não roda PHP, então o protótipo publicado usa
`jurisprudencia.mjs` no lugar do `bff/jurisprudencia.php`: é o mesmo
BFF, em Node — guarda a chave e assina cada chamada com HMAC.

No portal da OAB o papel inteiro é do `bff/jurisprudencia.php`. Apagar
esta pasta não afeta o portal em nada.
