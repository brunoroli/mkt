<?php
// Copie este arquivo para config.php (no servidor) e preencha.
// NUNCA coloque config.php no Git: ele guarda o token de acesso.
return [
    // Token de longa duração com as permissões instagram_basic e instagram_manage_insights
    // (normalmente um token de usuário/sistema da Meta que enxerga as páginas ligadas aos perfis).
    'access_token' => 'COLE_O_TOKEN_AQUI',

    // Versão da Graph API
    'api_version' => 'v21.0',

    // Chave usada na URL (?account=b3g) => rótulo e ID da conta profissional do Instagram.
    // O ID é o "Instagram Business Account ID", não o @ do perfil.
    'accounts' => [
        'b3g'    => ['label' => '@b3g_empreendimentos', 'ig_user_id' => 'PREENCHER'],
        'canada' => ['label' => '@residencialcanada',   'ig_user_id' => 'PREENCHER'],
    ],

    // Tempo de cache da resposta, em segundos
    'cache_ttl' => 900,
];
