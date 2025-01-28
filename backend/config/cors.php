<?php





return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:3000', 'http://localhost:5173'], // Liệt kê các URL cụ thể

    'allowed_origins_patterns' => ['*'], // Dùng biểu thức chính quy để cho phép tất cả

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Range', 'X-Total-Count'],

    'max_age' => 0,

    'supports_credentials' => true, // Cho phép gửi kèm cookie/xác thực
];
// return [

//     /*
//     |--------------------------------------------------------------------------
//     | Cross-Origin Resource Sharing (CORS) Configuration
//     |--------------------------------------------------------------------------
//     |
//     | Here you may configure your settings for cross-origin resource sharing
//     | or "CORS". This determines what cross-origin operations may execute
//     | in web browsers. You are free to adjust these settings as needed.
//     |
//     | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
//     |
//     */

//     'paths' => ['api/*', 'sanctum/csrf-cookie'],

//     'allowed_methods' => ['*'],

//     'allowed_origins' => ['*'],

//     'allowed_origins_patterns' => [],

//     'allowed_headers' => ['*'],

//     'exposed_headers' => ['Content-Range','X-Total-Count'],
//     //'exposed_headers' => ['X-Total-Count'],
//     'max_age' => 0,

//     'supports_credentials' => false,

// ];
