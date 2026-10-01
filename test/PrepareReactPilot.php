<?php
// Copies existing data to a NEW temporary directory; never changes the source database.
$destination = $argv[1] ?? sys_get_temp_dir() . '/grocy-react-pilot';
$tempRoot = realpath(sys_get_temp_dir());
$parent = realpath(dirname($destination));
if (!in_array($parent, [$tempRoot, realpath('/tmp')], true) || file_exists($destination))
{
    throw new Exception('Choose a new directory directly under the system temporary directory');
}
mkdir($destination);
mkdir($destination . '/viewcache');
$source = new PDO('sqlite:' . __DIR__ . '/../data/grocy.db');
$source->exec('VACUUM INTO ' . $source->quote($destination . '/grocy.db'));
copy(__DIR__ . '/../config-dist.php', $destination . '/config.php');
$db = new PDO('sqlite:' . $destination . '/grocy.db');
$query = $db->prepare('UPDATE users SET username=?, password=? WHERE id=1');
$query->execute(['pilot-admin', password_hash('pilot-test-password', PASSWORD_DEFAULT)]);
$db->exec("DELETE FROM users WHERE username='pilot-reader'");
$query = $db->prepare('INSERT INTO users(username,password) VALUES (?,?)');
$query->execute(['pilot-reader', password_hash('pilot-test-password', PASSWORD_DEFAULT)]);
// Restricted reader intentionally has no mutation permissions.
echo "Isolated test data prepared at $destination\n";
