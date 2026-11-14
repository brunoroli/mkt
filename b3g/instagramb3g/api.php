<?php
/**
 * Endpoint JSON do dashboard de Instagram da B3G (Instagram Graph API / Meta).
 *
 *   api.php?account=b3g&days=30            -> métricas + posts do período
 *   api.php?account=b3g&view=calendar&month=2026-11  -> posts publicados no mês
 *
 * As credenciais ficam em config.php (copie de config.sample.php). Nunca no front-end.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function fail(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = is_file(__DIR__ . '/config.php') ? include __DIR__ . '/config.php' : null;
if (!is_array($config) || empty($config['access_token']) || empty($config['accounts'])) {
    fail(500, 'config.php ausente ou incompleto');
}

$accounts = $config['accounts'];
$key = $_GET['account'] ?? array_key_first($accounts);
if (!isset($accounts[$key])) fail(400, 'conta desconhecida');
$igId = $accounts[$key]['ig_user_id'];
if (!$igId || $igId === 'PREENCHER') fail(500, 'ig_user_id não configurado para ' . $key);

$view = ($_GET['view'] ?? 'summary') === 'calendar' ? 'calendar' : 'summary';
$days = in_array((int)($_GET['days'] ?? 30), [7, 14, 30], true) ? (int)$_GET['days'] : 30;
$month = $_GET['month'] ?? date('Y-m');
if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) fail(400, 'month inválido (use AAAA-MM)');

$ttl = (int)($config['cache_ttl'] ?? 900);
$cacheFile = sys_get_temp_dir() . '/b3g_ig_' . md5($key . '|' . $view . '|' . ($view === 'calendar' ? $month : $days)) . '.json';
if ($ttl > 0 && is_file($cacheFile) && time() - filemtime($cacheFile) < $ttl) {
    readfile($cacheFile);
    exit;
}

$base = rtrim($config['api_base'] ?? 'https://graph.facebook.com', '/') . '/' . ($config['api_version'] ?? 'v21.0') . '/';

function graph(string $url, array $params = []): array {
    global $config;
    if (!preg_match('#^https?://#', $url)) $url = $GLOBALS['base'] . ltrim($url, '/');
    if (strpos($url, 'access_token=') === false) $params['access_token'] = $config['access_token'];
    $full = $params ? $url . (strpos($url, '?') === false ? '?' : '&') . http_build_query($params) : $url;
    $ch = curl_init($full);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 25]);
    $raw = curl_exec($ch);
    if ($raw === false) { $e = curl_error($ch); curl_close($ch); throw new RuntimeException('rede: ' . $e); }
    curl_close($ch);
    $json = json_decode($raw, true);
    if (!is_array($json)) throw new RuntimeException('resposta inválida da Meta');
    if (isset($json['error'])) throw new RuntimeException(($json['error']['message'] ?? 'erro') . ' (código ' . ($json['error']['code'] ?? '?') . ')');
    return $json;
}

function accountList(array $accounts): array {
    $out = [];
    foreach ($accounts as $k => $a) $out[] = ['key' => $k, 'label' => $a['label']];
    return $out;
}

function mapPost(array $m): array {
    $type = $m['media_product_type'] ?? '';
    return [
        'id' => $m['id'],
        'caption' => $m['caption'] ?? '',
        'type' => $type === 'REELS' ? 'REELS' : ($m['media_type'] ?? 'IMAGE'),
        'permalink' => $m['permalink'] ?? '',
        'thumbnail' => $m['thumbnail_url'] ?? ($m['media_url'] ?? ''),
        'timestamp' => $m['timestamp'],
        'likes' => $m['like_count'] ?? null,
        'comments' => $m['comments_count'] ?? null,
    ];
}

/** Lista posts de $fromTs (inclusive) até $toTs (exclusive), paginando. */
function fetchMedia(string $igId, int $fromTs, int $toTs, int $maxPages = 12): array {
    $fields = 'id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp,like_count,comments_count';
    $page = graph("$igId/media", ['fields' => $fields, 'limit' => 50]);
    $posts = [];
    for ($i = 0; $i < $maxPages; $i++) {
        $stop = false;
        foreach ($page['data'] ?? [] as $m) {
            $ts = strtotime($m['timestamp']);
            if ($ts >= $toTs) continue;
            if ($ts < $fromTs) { $stop = true; continue; }
            $posts[] = mapPost($m);
        }
        $next = $page['paging']['next'] ?? null;
        if ($stop || !$next) break;
        // a URL "next" já inclui o token e os parâmetros
        $page = graph($next);
    }
    return $posts;
}

try {
    $profile = graph($igId, ['fields' => 'username,followers_count,media_count,profile_picture_url']);
    $account = [
        'key' => $key,
        'username' => $profile['username'] ?? '',
        'followers' => $profile['followers_count'] ?? null,
        'mediaCount' => $profile['media_count'] ?? null,
        'profilePicture' => $profile['profile_picture_url'] ?? '',
    ];
    $tz = new DateTimeZone('America/Sao_Paulo');

    if ($view === 'calendar') {
        $start = new DateTimeImmutable($month . '-01 00:00:00', $tz);
        $end = $start->modify('+1 month');
        $posts = fetchMedia($igId, $start->getTimestamp(), $end->getTimestamp());
        $result = [
            'generatedAt' => date('c'), 'month' => $month,
            'accounts' => accountList($accounts), 'account' => $account, 'posts' => $posts,
        ];
    } else {
        $errors = [];
        $until = time();
        $since = $until - $days * 86400;

        // Métricas de total no período (uma chamada por métrica: se uma não existir, as outras seguem)
        $totalMetrics = ['reach', 'views', 'profile_views', 'website_clicks', 'accounts_engaged', 'total_interactions', 'likes', 'comments', 'shares', 'saves'];
        $summary = [];
        foreach ($totalMetrics as $metric) {
            try {
                $r = graph("$igId/insights", ['metric' => $metric, 'metric_type' => 'total_value', 'period' => 'day', 'since' => $since, 'until' => $until]);
                $summary[$metric] = $r['data'][0]['total_value']['value'] ?? null;
            } catch (Throwable $e) { $summary[$metric] = null; $errors[] = "$metric: " . $e->getMessage(); }
        }

        // Séries diárias
        $series = [];
        foreach (['reach', 'follower_count'] as $metric) {
            try {
                $r = graph("$igId/insights", ['metric' => $metric, 'period' => 'day', 'since' => $since, 'until' => $until]);
                foreach ($r['data'][0]['values'] ?? [] as $v) {
                    // end_time marca o fim do dia reportado; o dia é o anterior
                    $d = (new DateTimeImmutable($v['end_time']))->modify('-1 day')->setTimezone($tz)->format('Y-m-d');
                    $series[$d][$metric] = $v['value'];
                }
            } catch (Throwable $e) { $errors[] = "$metric diário: " . $e->getMessage(); }
        }
        ksort($series);
        $daily = [];
        foreach ($series as $d => $vals) $daily[] = ['date' => $d, 'reach' => $vals['reach'] ?? 0, 'newFollowers' => $vals['follower_count'] ?? 0];
        $summary['newFollowers'] = array_sum(array_column($daily, 'newFollowers'));
        $summary['engagementRate'] = !empty($summary['reach']) && $summary['total_interactions'] !== null
            ? $summary['total_interactions'] / $summary['reach'] * 100 : null;

        // Posts do período, com insights dos 15 mais recentes
        $posts = fetchMedia($igId, $since, $until + 86400);
        foreach ($posts as $i => &$p) {
            $p['reach'] = $p['views'] = $p['saves'] = $p['shares'] = null;
            if ($i >= 15) continue;
            foreach ([['reach', 'saved', 'shares', 'views'], ['reach', 'saved']] as $set) {
                try {
                    $r = graph($p['id'] . '/insights', ['metric' => implode(',', $set)]);
                    foreach ($r['data'] ?? [] as $row) {
                        $val = $row['values'][0]['value'] ?? null;
                        match ($row['name']) { 'reach' => $p['reach'] = $val, 'saved' => $p['saves'] = $val, 'shares' => $p['shares'] = $val, 'views' => $p['views'] = $val, default => null };
                    }
                    break;
                } catch (Throwable $e) { /* tenta o conjunto menor */ }
            }
        }
        unset($p);

        $result = [
            'generatedAt' => date('c'), 'days' => $days,
            'accounts' => accountList($accounts), 'account' => $account,
            'summary' => $summary, 'daily' => $daily, 'posts' => $posts, 'errors' => $errors,
        ];
    }
} catch (Throwable $e) {
    fail(502, $e->getMessage());
}

$json = json_encode($result, JSON_UNESCAPED_UNICODE);
if ($ttl > 0) @file_put_contents($cacheFile, $json);
echo $json;
