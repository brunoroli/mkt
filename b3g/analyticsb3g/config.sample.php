<?php
// Copie para config.php (no servidor) e preencha. config.php não vai para o Git.
return [
    // Propriedade GA4 "B3G Empreendimentos" (é o ID numérico da propriedade, não o G-XXXX de métricas)
    'property_id' => '564370316',

    // Chave JSON da conta de serviço do Google (com acesso de "Leitor" na propriedade GA4).
    // IMPORTANTE: guarde FORA da pasta pública (public_html), por exemplo:
    //   /home/USUARIO/segredos/b3g-ga4.json
    // Quem acessa esse arquivo lê os dados do Analytics.
    'service_account_file' => '/home/USUARIO/segredos/b3g-ga4.json',

    // Os dados do GA4 começam nesta data; períodos mais longos são cortados aqui.
    'data_start' => '2026-11-14',

    // Cache da resposta, em segundos
    'cache_ttl' => 900,
];
