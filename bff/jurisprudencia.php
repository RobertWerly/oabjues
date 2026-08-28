<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const ROTAS_POST = ['busca'];

function responder(int $status, array $corpo): never {
    http_response_code($status);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$base    = getenv('OABJUS_URL')     ?: '';
$chave   = getenv('OABJUS_CHAVE')   ?: '';
$segredo = getenv('OABJUS_SEGREDO') ?: '';
if ($base === '' || $chave === '' || $segredo === '') {
    responder(503, ['erro' => 'serviço de jurisprudência não configurado']);
}

$rota = (string) ($_GET['rota'] ?? '');
// Allowlist de rota: o parâmetro vem do navegador e não pode virar caminho
// arbitrário no host de destino.
if (!preg_match('#^(busca|vocabulario|recentes/[a-z_]{3,40}|acordao/[0-9a-fA-F-]{36})$#', $rota)) {
    responder(400, ['erro' => 'rota inválida']);
}

$metodo = in_array(explode('/', $rota)[0], ROTAS_POST, true) ? 'POST' : 'GET';
$corpo  = '';
if ($metodo === 'POST') {
    $corpo = file_get_contents('php://input') ?: '';
    if (strlen($corpo) > 8192) {
        responder(413, ['erro' => 'pedido grande demais']);
    }
    if ($corpo !== '' && json_decode($corpo) === null && json_last_error() !== JSON_ERROR_NONE) {
        responder(400, ['erro' => 'corpo inválido: esperado JSON']);
    }
}

// A assinatura cobre a ROTA CANÔNICA, não o caminho completo da URL.
//
// MEDIDO em produção: o gateway do Supabase corta o prefixo /functions/v1
// antes de a função ver a requisição — ela enxerga /oab-api/busca, não
// /functions/v1/oab-api/busca. Assinar o caminho completo fazia os dois lados
// assinarem strings diferentes, e NENHUMA chamada autenticava.
//
// A rota canônica é só o que vem depois de oab-api, com barra na frente.
$caminho = '/' . $rota;

// A query NÃO entra na assinatura — por isso cada parâmetro que atravessa é
// higienizado aqui, um a um, e nenhum outro passa.
$destino = rtrim($base, '/') . '/' . $rota;
if ($rota === 'vocabulario' && isset($_GET['recurso'])) {
    // Só o nome do recurso atravessa, e só se parecer com um.
    $recurso = preg_replace('/[^a-z_]/', '', (string) $_GET['recurso']);
    $destino .= '?recurso=' . rawurlencode($recurso);
} elseif (str_starts_with($rota, 'recentes/') && isset($_GET['pagina'])) {
    $pagina = max(1, min(10, (int) $_GET['pagina']));
    $destino .= '?pagina=' . $pagina;
}

$ts    = (string) (int) (microtime(true) * 1000);
$nonce = bin2hex(random_bytes(16));
$base_assinatura = implode("\n", [
    $metodo,
    $caminho,
    $ts,
    $nonce,
    hash('sha256', $corpo),
]);
$assinatura = hash_hmac('sha256', $base_assinatura, $segredo);

$ch = curl_init($destino);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_TIMEOUT        => 25,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-oab-key: ' . $chave,
        'x-oab-timestamp: ' . $ts,
        'x-oab-nonce: ' . $nonce,
        'x-oab-signature: ' . $assinatura,
    ],
] + ($metodo === 'POST' ? [CURLOPT_POSTFIELDS => $corpo] : []));

$resposta = curl_exec($ch);
$status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$falhou   = $resposta === false;
curl_close($ch);

if ($falhou || $status === 0) {
    responder(502, ['erro' => 'serviço de jurisprudência indisponível']);
}

// Repassa o JSON como veio. A projeção é responsabilidade da API, não daqui:
// duas camadas decidindo o que sai é duas camadas para manter em dia.
http_response_code($status);
echo $resposta;
