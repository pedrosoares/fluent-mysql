# Mysql driver for FLUENT-ORM
This package contain the driver to be used on fluent-orm package.

## Usage
on the root project
```
npm install fluent-mysql-driver
```
on the fluent configuration file
```JavaScript
const { configurator }  = require("fluent-orm");
const mysql_driver = require("fluent-mysql-driver");
// Register Driver
configurator.use(mysql_driver.configure);
// Configure driver connection
configurator.configure({
    'default': 'mysql',
    'connections': {
        'mysql': {
            'driver': 'mysql',
            'host': '127.0.0.1',
            'port': '3306',
            'database': 'forge',
            'user': 'root',
            'password': '1234'
        }
    }
});
```
