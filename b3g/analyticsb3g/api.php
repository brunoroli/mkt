<?php
/**
 * Endpoint JSON da aba "Site" do dashboard B3G (Google Analytics 4, Data API).
 *
 *   api.php?days=30   (7, 30 ou 90)
 *
 * Autenticação: conta de serviço do Google. O JSON da chave NUNCA deve ficar dentro de
 * public_html; veja config.sample.php. Nada disso vai para o navegador.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function fail(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = is_file(__DIR__ . '/config.php') ? include __DIR__ . '/config.php' : null;
if (!is_array($config) || empty($config['property_id']) || empty($config['service_account_file'])) {
    fail(500, 'config.php ausente ou incompleto');
}
if (!is_readable($config['service_account_file'])) fail(500, 'arquivo da conta de serviço não encontrado ou sem permissão de leitura');

$days = in_array((int)($_GET['days'] ?? 30), [7, 30, 90], true) ? (int)$_GET['days'] : 30;
$tz = new DateTimeZone('America/Sao_Paulo');
$today = new DateTimeImmutable('today', $tz);
$start = $today->modify('-' . ($days - 1) . ' days');
$dataStart = !empty($config['data_start']) ? new DateTimeImmutable($config['data_start'], $tz) : null;
$clipped = false;
if ($dataStart && $start < $dataStart) { $start = $dataStart; $clipped = true; }
$startStr = $start->format('Y-m-d');
$endStr = $today->format('Y-m-d');

$ttl = (int)($config['cache_ttl'] ?? 900);
$cacheFile = sys_get_temp_dir() . '/b3g_ga4_' . md5($config['property_id'] . "|$startStr|$endStr") . '.json';
if ($ttl > 0 && is_file($cacheFile) && time() - filemtime($cacheFile) < $ttl) { readfile($cacheFile); exit; }

function b64u(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }

function http(string $url, array $headers, string $body): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 25]);
    $raw = curl_exec($ch);
    if ($raw === false) { $e = curl_error($ch); curl_close($ch); throw new RuntimeException('rede: ' . $e); }
    curl_close($ch);
    $json = json_decode($raw, true);
    if (!is_array($json)) throw new RuntimeException('resposta inválida do Google');
    if (isset($json['error'])) {
        $m = is_array($json['error']) ? ($json['error']['message'] ?? 'erro') : ($json['error_description'] ?? $json['error']);
        throw new RuntimeException($m);
    }
    return $json;
}

/** Token de acesso da conta de serviço (cache em arquivo, ~50 min). */
function accessToken(array $config): string {
    $sa = json_decode(file_get_contents($config['service_account_file']), true);
    if (!is_array($sa) || empty($sa['client_email']) || empty($sa['private_key'])) throw new RuntimeException('JSON da conta de serviço inválido');
    $cache = sys_get_temp_dir() . '/b3g_ga4_token_' . md5($sa['client_email']) . '.json';
    if (is_file($cache)) {
        $c = json_decode(file_get_contents($cache), true);
        if (is_array($c) && ($c['exp'] ?? 0) > time() + 60) return $c['token'];
    }
    $now = time();
    $aud = $config['oauth_url'] ?? 'https://oauth2.googleapis.com/token';
    $unsigned = b64u(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])) . '.' . b64u(json_encode([
        'iss' => $sa['client_email'], 'scope' => 'https://www.googleapis.com/auth/analytics.readonly',
        'aud' => $aud, 'iat' => $now, 'exp' => $now + 3600,
    ]));
    if (!openssl_sign($unsigned, $sig, $sa['private_key'], OPENSSL_ALGO_SHA256)) throw new RuntimeException('falha ao assinar o JWT (chave privada)');
    $r = http($aud, ['Content-Type: application/x-www-form-urlencoded'],
        http_build_query(['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $unsigned . '.' . b64u($sig)]));
    $token = $r['access_token'] ?? null;
    if (!$token) throw new RuntimeException('Google não devolveu access_token');
    @file_put_contents($cache, json_encode(['token' => $token, 'exp' => $now + (int)($r['expires_in'] ?? 3000)]));
    @chmod($cache, 0600);
    return $token;
}

function runReport(array $config, string $token, array $body): array {
    $base = rtrim($config['data_api_base'] ?? 'https://analyticsdata.googleapis.com', '/');
    return http("$base/v1beta/properties/" . $config['property_id'] . ':runReport',
        ['Content-Type: application/json', 'Authorization: Bearer ' . $token], json_encode($body));
}

function rows(array $report): array {
    $out = [];
    foreach ($report['rows'] ?? [] as $r) {
        $d = array_map(fn($x) => $x['value'], $r['dimensionValues'] ?? []);
        $m = array_map(fn($x) => (float)$x['value'], $r['metricValues'] ?? []);
        $out[] = [$d, $m];
    }
    return $out;
}

$range = [['startDate' => $startStr, 'endDate' => $endStr]];
$errors = [];

try {
    $token = accessToken($config);

    // Cada bloco é independente: se um falhar, os outros continuam.
    $blocks = [
        'totals' => ['dateRanges' => $range, 'metrics' => array_map(fn($n) => ['name' => $n], ['sessions', 'totalUsers', 'newUsers', 'screenPageViews', 'engagementRate'])],
        'daily' => ['dateRanges' => $range, 'dimensions' => [['name' => 'date']], 'metrics' => [['name' => 'sessions'], ['name' => 'totalUsers']], 'orderBys' => [['dimension' => ['dimensionName' => 'date']]], 'limit' => 100],
        'channels' => ['dateRanges' => $range, 'dimensions' => [['name' => 'sessionDefaultChannelGroup']], 'metrics' => [['name' => 'sessions']], 'orderBys' => [['metric' => ['metricName' => 'sessions'], 'desc' => true]], 'limit' => 10],
        'sources' => ['dateRanges' => $range, 'dimensions' => [['name' => 'sessionSourceMedium']], 'metrics' => [['name' => 'sessions'], ['name' => 'totalUsers']], 'orderBys' => [['metric' => ['metricName' => 'sessions'], 'desc' => true]], 'limit' => 10],
        'pages' => ['dateRanges' => $range, 'dimensions' => [['name' => 'pagePath']], 'metrics' => [['name' => 'screenPageViews'], ['name' => 'totalUsers']], 'orderBys' => [['metric' => ['metricName' => 'screenPageViews'], 'desc' => true]], 'limit' => 10],
        'events' => ['dateRanges' => $range, 'dimensions' => [['name' => 'date'], ['name' => 'eventName']], 'metrics' => [['name' => 'eventCount']],
            'dimensionFilter' => ['filter' => ['fieldName' => 'eventName', 'inListFilter' => ['values' => ['click_whatsapp', 'generate_lead']]]], 'limit' => 500],
    ];
    $rep = [];
    foreach ($blocks as $k => $body) {
        try { $rep[$k] = runReport($config, $token, $body); }
        catch (Throwable $e) { $rep[$k] = []; $errors[] = "$k: " . $e->getMessage(); }
    }
} catch (Throwable $e) {
    fail(502, $e->getMessage());
}

$t = rows($rep['totals'])[0][1] ?? [0, 0, 0, 0, 0];
$totals = ['sessions' => (int)$t[0], 'users' => (int)$t[1], 'newUsers' => (int)$t[2], 'pageViews' => (int)$t[3], 'engagementRate' => $t[4] * 100];

// Série diária completa (dias sem dados viram zero)
$daily = [];
for ($d = $start; $d <= $today; $d = $d->modify('+1 day')) $daily[$d->format('Ymd')] = ['date' => $d->format('Y-m-d'), 'sessions' => 0, 'users' => 0, 'whatsapp' => 0, 'leads' => 0];
foreach (rows($rep['daily']) as [$dim, $m]) if (isset($daily[$dim[0]])) { $daily[$dim[0]]['sessions'] = (int)$m[0]; $daily[$dim[0]]['users'] = (int)$m[1]; }
$totals['whatsapp'] = $totals['leads'] = 0;
foreach (rows($rep['events']) as [$dim, $m]) {
    $key = $dim[1] === 'click_whatsapp' ? 'whatsapp' : ($dim[1] === 'generate_lead' ? 'leads' : null);
    if (!$key) continue;
    if (isset($daily[$dim[0]])) $daily[$dim[0]][$key] += (int)$m[0];
    $totals[$key] += (int)$m[0];
}
$totals['leadRate'] = $totals['sessions'] > 0 ? $totals['leads'] / $totals['sessions'] * 100 : null;

$result = [
    'generatedAt' => date('c'), 'days' => $days, 'start' => $startStr, 'end' => $endStr,
    'dataStart' => $config['data_start'] ?? null, 'clipped' => $clipped,
    'totals' => $totals, 'daily' => array_values($daily),
    'channels' => array_map(fn($r) => ['name' => $r[0][0], 'sessions' => (int)$r[1][0]], rows($rep['channels'])),
    'sources' => array_map(fn($r) => ['name' => $r[0][0], 'sessions' => (int)$r[1][0], 'users' => (int)$r[1][1]], rows($rep['sources'])),
    'pages' => array_map(fn($r) => ['path' => $r[0][0], 'views' => (int)$r[1][0], 'users' => (int)$r[1][1]], rows($rep['pages'])),
    'errors' => $errors,
];

$json = json_encode($result, JSON_UNESCAPED_UNICODE);
if ($ttl > 0) @file_put_contents($cacheFile, $json);
echo $json;
