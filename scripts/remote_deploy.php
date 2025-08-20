<?php

// Simple remote deploy helper for shared hosting (InfinityFree)
// - Expects app.zip and htdocs.zip to be located under /htdocs
// - Extracts app.zip into /laravel-app and htdocs.zip into /htdocs
// - Deletes itself and zip files after success (unless KEEP_DEPLOY_SCRIPT=1)
// SECURITY:
// - Requires a token provided via HTTP header: X-Deploy-Token (POST only)
// - Optional HMAC protection with timestamp (headers: X-Deploy-Timestamp, X-Deploy-Signature)
//   where signature = HMAC_SHA256(timestamp, token). Timestamp is UNIX seconds, +/- 10 min.

// 1) Configure a token via server environment or inline fallback
$envToken = getenv('DEPLOY_TOKEN');
$inlineToken = 'CHANGE_ME'; // will be ignored if DEPLOY_TOKEN env exists
$expected = $envToken ?: $inlineToken;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo 'Method Not Allowed';
    exit;
}

$provided = '';
if (! empty($_SERVER['HTTP_X_DEPLOY_TOKEN'])) {
    $provided = $_SERVER['HTTP_X_DEPLOY_TOKEN'];
}

if (! $expected || ! $provided || ! hash_equals($expected, $provided)) {
    http_response_code(403);
    echo 'Forbidden';
    exit;
}

// Optional HMAC check
$ts = isset($_SERVER['HTTP_X_DEPLOY_TIMESTAMP']) ? (int) $_SERVER['HTTP_X_DEPLOY_TIMESTAMP'] : 0;
$sig = isset($_SERVER['HTTP_X_DEPLOY_SIGNATURE']) ? $_SERVER['HTTP_X_DEPLOY_SIGNATURE'] : '';
if ($ts && $sig) {
    $now = time();
    if (abs($now - $ts) > 600) { // 10 minutes window
        http_response_code(401);
        echo 'Stale timestamp';
        exit;
    }
    $expectedSig = hash_hmac('sha256', (string) $ts, $expected);
    if (! hash_equals($expectedSig, $sig)) {
        http_response_code(401);
        echo 'Invalid signature';
        exit;
    }
}

// Simple lock to avoid concurrent runs
$lock = sys_get_temp_dir().'/remote_deploy.lock';
if (file_exists($lock) && (time() - filemtime($lock)) < 900) {
    http_response_code(429);
    echo 'Deployment already in progress';
    exit;
}
@touch($lock);

// 2) Runtime/limits
@ini_set('memory_limit', '512M');
@set_time_limit(0);

// 3) Paths
$htdocs = rtrim(realpath(__DIR__.'/..'), '/').'/';
$appZip = $htdocs.'app.zip';
$htdocsZip = $htdocs.'htdocs.zip';
$appTarget = dirname($htdocs).'/laravel-app';

function rrmdir($dir)
{
    if (! is_dir($dir)) {
        return;
    }
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($items as $item) {
        $item->isDir() ? rmdir($item->getPathname()) : unlink($item->getPathname());
    }
    rmdir($dir);
}

function cleanDirExcept($dir, array $keepNames)
{
    if (! is_dir($dir)) {
        return;
    }
    $dh = opendir($dir);
    if (! $dh) {
        return;
    }
    while (($entry = readdir($dh)) !== false) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        if (in_array($entry, $keepNames, true)) {
            continue;
        }
        $path = $dir.DIRECTORY_SEPARATOR.$entry;
        if (is_dir($path)) {
            rrmdir($path);
        } else {
            @unlink($path);
        }
    }
    closedir($dh);
}

function extractZip($zipPath, $destDir)
{
    $zip = new ZipArchive;
    if ($zip->open($zipPath) !== true) {
        throw new RuntimeException('Failed to open '.basename($zipPath));
    }
    if (! is_dir($destDir)) {
        mkdir($destDir, 0755, true);
    }
    // Clean destination before extracting
    // Warning: this removes everything under the dir
    rrmdir($destDir);
    mkdir($destDir, 0755, true);
    if (! $zip->extractTo($destDir)) {
        $zip->close();
        throw new RuntimeException('Failed to extract '.basename($zipPath));
    }
    $zip->close();
}

header('Content-Type: text/plain');

try {
    // 3) Extract Laravel core to /laravel-app
    if (! file_exists($appZip)) {
        throw new RuntimeException('Missing app.zip');
    }
    extractZip($appZip, $appTarget);

    // 4) Extract public files to /htdocs (this script lives in /htdocs/.deploy)
    if (! file_exists($htdocsZip)) {
        throw new RuntimeException('Missing htdocs.zip');
    }
    // Clean all in htdocs except the .deploy folder and the zip files themselves
    cleanDirExcept($htdocs, ['.deploy', '.well-known', basename($appZip), basename($htdocsZip)]);
    $zip = new ZipArchive;
    if ($zip->open($htdocsZip) !== true) {
        throw new RuntimeException('Failed to open '.basename($htdocsZip));
    }
    if (! $zip->extractTo($htdocs)) {
        $zip->close();
        throw new RuntimeException('Failed to extract '.basename($htdocsZip));
    }
    $zip->close();

    // 5) Cleanup zips
    @unlink($appZip);
    @unlink($htdocsZip);

    // 6) Optionally self-delete (keep if KEEP_DEPLOY_SCRIPT=1)
    if (! getenv('KEEP_DEPLOY_SCRIPT')) {
        @unlink(__FILE__);
    }

    echo 'OK';
    @unlink($lock);
} catch (Throwable $e) {
    http_response_code(500);
    echo 'ERROR: '.$e->getMessage();
    @unlink($lock);
}
