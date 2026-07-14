-- Run after database/equiptrack.sql.
-- Run using a MySQL root/admin connection.
-- Replace the password placeholder before running.

DROP USER IF EXISTS 'equiptrack_user'@'localhost';

CREATE USER 'equiptrack_user'@'localhost'
IDENTIFIED WITH caching_sha2_password
BY 'CHANGE_TO_YOUR_OWN_PASSWORD';

GRANT ALL PRIVILEGES
ON equiptrack.*
TO 'equiptrack_user'@'localhost';

FLUSH PRIVILEGES;

SELECT
    user,
    host,
    plugin
FROM mysql.user
WHERE user = 'equiptrack_user';
